
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookToken, sendWhatsAppMessage } from '@/lib/whatsapp';
import { PrismaClient } from '@prisma/client';
// import { triageLead } from '@/lib/gemini'; // Future integration

const prisma = new PrismaClient();

// GET: Verification Challenge (Used by Meta)
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (verifyWebhookToken(mode, token)) {
        console.log('✅ Webhook Verified!');
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST: Incoming Messages
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Debug: Log incoming webhook
        // console.log('📩 WhatsApp Webhook:', JSON.stringify(body, null, 2));

        // Handle incoming messages
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {

                    const value = change.value;

                    if (value.messages && value.messages.length > 0) {
                        const msg = value.messages[0];
                        const contact = value.contacts?.[0]; // Sender info

                        if (msg.type === 'text') {
                            const from = msg.from; // Phone number
                            const text = msg.text.body;
                            const name = contact?.profile?.name || 'Unknown';

                            console.log(`💬 Msg from ${name} (${from}): ${text}`);

                            // 1. Find or Create Lead
                            // Note: Meta sends phone without '+', often standard format (e.g. 5511999999999)
                            let lead = await prisma.lead.findFirst({
                                where: { phone: { contains: from.slice(-8) } } // Loose matching for safety
                            });

                            if (!lead) {
                                // Create New Lead
                                lead = await prisma.lead.create({
                                    data: {
                                        name: name,
                                        phone: from,
                                        source: 'whatsapp_inbound',
                                        message: text,
                                        status: 'NEW',
                                        tags: 'auto_created'
                                    }
                                });
                                console.log(`🆕 New Lead Created: ${lead.id}`);

                                // Trigger Triage (Async)
                                // await triageLead(lead.id, text);

                                // Auto-reply (Simple MVP Rule: if new)
                                await sendWhatsAppMessage(from, "Olá! Sou a IA do LeadTriage. Recebi sua mensagem e já estou analisando. Em instantes retorno.");

                            } else {
                                // Update Existing conversation (Log event)
                                await prisma.eventLog.create({
                                    data: {
                                        leadId: lead.id,
                                        type: "MESSAGE_RECEIVED",
                                        payload: `[${from}] ${text}`
                                    }
                                });
                                console.log(`📝 Logged message for lead: ${lead.id}`);
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
