
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { leadId, message } = await req.json();

        if (!leadId || !message) {
            return NextResponse.json({ error: 'Missing leadId or message' }, { status: 400 });
        }

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!lead || !lead.phone) {
            return NextResponse.json({ error: 'Lead not found or missing phone' }, { status: 404 });
        }

        // Send via Meta API
        const result = await sendWhatsAppMessage(lead.phone, message);

        if (!result) {
            // If Meta fails (e.g. token expired, 24h window), we still log it but mark as failed?
            // For MVP, we error out.
            return NextResponse.json({ error: 'Failed to send WhatsApp message via Meta API' }, { status: 502 });
        }

        // Log the Sent Message
        await prisma.eventLog.create({
            data: {
                leadId: lead.id,
                type: 'MESSAGE_SENT',
                payload: message
            }
        });

        return NextResponse.json({ success: true, meta_id: result.messages?.[0]?.id });

    } catch (error) {
        console.error('Send API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
