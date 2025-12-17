
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
    try {
        // Find all messages that are due to be sent
        const now = new Date();
        const dueMessages = await prisma.scheduledMessage.findMany({
            where: {
                scheduledFor: { lte: now },
                sent: false,
                cancelled: false
            },
            include: {
                lead: true
            },
            take: 50 // Process max 50 at a time
        });

        console.log(`📨 Processing ${dueMessages.length} scheduled messages...`);

        const results = [];
        for (const msg of dueMessages) {
            // Check if lead has responded since scheduling (cancel if so)
            const recentActivity = await prisma.eventLog.findFirst({
                where: {
                    leadId: msg.leadId,
                    createdAt: { gte: msg.createdAt },
                    type: { in: ['TRIAGE_COMPLETED', 'AUTOREPLY_SENT'] }
                }
            });

            if (recentActivity) {
                // Lead has interacted - cancel follow-up
                await prisma.scheduledMessage.update({
                    where: { id: msg.id },
                    data: {
                        cancelled: true,
                        cancelledReason: 'lead_responded'
                    }
                });
                results.push({ id: msg.id, status: 'cancelled', reason: 'lead_responded' });
                continue;
            }

            // Send the message
            const sendResult = await sendWhatsAppMessage(msg.lead.phone, msg.message);

            if (sendResult) {
                await prisma.scheduledMessage.update({
                    where: { id: msg.id },
                    data: {
                        sent: true,
                        sentAt: now
                    }
                });

                // Log event
                await prisma.eventLog.create({
                    data: {
                        leadId: msg.leadId,
                        type: 'FOLLOWUP_SENT',
                        payload: JSON.stringify({ messageId: msg.id, message: msg.message })
                    }
                });

                results.push({ id: msg.id, status: 'sent' });
                console.log(`✅ Sent follow-up to ${msg.lead.name}`);
            } else {
                results.push({ id: msg.id, status: 'failed' });
                console.error(`❌ Failed to send to ${msg.lead.name}`);
            }
        }

        return NextResponse.json({
            processed: dueMessages.length,
            results
        });
    } catch (error) {
        console.error('Follow-up processor error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// GET endpoint to check pending messages (for debugging)
export async function GET() {
    const pending = await prisma.scheduledMessage.count({
        where: {
            sent: false,
            cancelled: false
        }
    });

    const due = await prisma.scheduledMessage.count({
        where: {
            scheduledFor: { lte: new Date() },
            sent: false,
            cancelled: false
        }
    });

    return NextResponse.json({ pending, due });
}
