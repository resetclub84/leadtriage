import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triageLead } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const { leadId } = await req.json();

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

        await prisma.lead.update({ where: { id: leadId }, data: { status: 'TRIAGING' } });

        const result = await triageLead(lead.message);

        // Upsert Triage Result
        await prisma.triageResult.upsert({
            where: { leadId },
            update: {
                resposta_ao_usuario: result.resposta_ao_usuario,
                intent: result.intent,
                lead_score: result.lead_score,
                interesse_principal: result.interesse_principal,
                nivel_urgencia: result.nivel_urgencia,
                provavel_plano: result.provavel_plano,
                indicacao_programa: result.indicacao_programa,
                precisa_humano: result.precisa_humano,
                possivel_ticket: result.dados_complementares?.possivel_ticket,
                probabilidade_fechamento: result.dados_complementares?.probabilidade_fechamento,
                observacoes: result.dados_complementares?.observacoes,
                raw_json: result
            },
            create: {
                leadId,
                resposta_ao_usuario: result.resposta_ao_usuario,
                intent: result.intent,
                lead_score: result.lead_score,
                interesse_principal: result.interesse_principal,
                nivel_urgencia: result.nivel_urgencia,
                provavel_plano: result.provavel_plano,
                indicacao_programa: result.indicacao_programa,
                precisa_humano: result.precisa_humano,
                possivel_ticket: result.dados_complementares?.possivel_ticket,
                probabilidade_fechamento: result.dados_complementares?.probabilidade_fechamento,
                observacoes: result.dados_complementares?.observacoes,
                raw_json: result
            }
        });

        await prisma.lead.update({ where: { id: leadId }, data: { status: 'NEW' } }); // Reset to NEW or whatever flow dictates

        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Triage failed' }, { status: 500 });
    }
}
