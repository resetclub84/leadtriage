import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triageLead } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, email, message, source } = body;

        // 1. Create Lead (NEW)
        const lead = await prisma.lead.create({
            data: {
                name,
                phone,
                tags: "webhook_lead",
                message,
                source: source || 'webhook',
                status: 'NEW',
                events: {
                    create: {
                        type: 'LEAD_CREATED',
                        payload: body
                    }
                }
            },
        });

        // 2. Trigger Triage (in background usually, but here await for MVP simplicity or use fire-and-forget)
        // For MVP, we'll do it synchronously to ensure result is ready
        await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'TRIAGING' }
        });

        const triageResult = await triageLead(message);

        // 3. Save Triage Result
        await prisma.triageResult.create({
            data: {
                leadId: lead.id,
                resposta_ao_usuario: triageResult.resposta_ao_usuario,
                intent: triageResult.intent,
                lead_score: triageResult.lead_score,
                interesse_principal: triageResult.interesse_principal,
                nivel_urgencia: triageResult.nivel_urgencia,
                provavel_plano: triageResult.provavel_plano,
                indicacao_programa: triageResult.indicacao_programa,
                precisa_humano: triageResult.precisa_humano,
                possivel_ticket: triageResult.dados_complementares?.possivel_ticket,
                probabilidade_fechamento: triageResult.dados_complementares?.probabilidade_fechamento,
                observacoes: triageResult.dados_complementares?.observacoes,
                raw_json: triageResult
            }
        });

        // 4. Update Status & Log
        await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'NEW' }
        });

        // --- AUTOPILOT: SEND WHATSAPP REPLY ---
        console.log("🤖 Autopilot Triggered: Sending reply...");
        const { sendWhatsAppMessage } = require('@/lib/whatsapp');

        let sentStatus = 'FAILED';
        if (phone && triageResult.resposta_ao_usuario) {
            const result = await sendWhatsAppMessage(phone, triageResult.resposta_ao_usuario);
            if (result) sentStatus = 'SENT';
        }
        // ---------------------------------------

        await prisma.eventLog.create({
            data: {
                leadId: lead.id,
                type: 'AUTOREPLY_SENT',
                payload: JSON.stringify({
                    message: triageResult.resposta_ao_usuario,
                    status: sentStatus
                })
            }
        });

        // Schedule automatic follow-ups (24h, 7d, 30d)
        const { scheduleFollowUps } = require('@/lib/followups');
        await scheduleFollowUps(lead.id);
        console.log('📅 Follow-ups scheduled');
        // ---------------------------------------

        // 5. N8N Webhook (Optional)
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nUrl) {
            const payload = {
                lead,
                triage: triageResult,
                action_links: {
                    whatsapp_url: phone ? `${process.env.NEXT_PUBLIC_WHATSAPP_BASE}/${phone}` : null,
                    google_form_url: process.env.NEXT_PUBLIC_GOOGLE_FORM_URL
                }
            };

            try {
                await fetch(n8nUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (e) {
                console.error("N8N Webhook Error", e);
            }
        }

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
