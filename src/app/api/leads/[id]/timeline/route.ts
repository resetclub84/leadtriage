import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const body = await req.json();
        const { type, payload } = body;

        // 1. Create Event
        await prisma.eventLog.create({
            data: {
                leadId: id,
                type: type, // "CONTACT_LOGGED", "NOTE_ADDED", etc.
                payload: payload ? JSON.stringify(payload) : null
            }
        });

        // 2. Update Lead if it's a contact
        if (type === 'CONTACT_LOGGED') {
            await prisma.lead.update({
                where: { id },
                data: { lastContactAt: new Date() }
            });
        }

        // 3. Update Lead if owner changed
        if (type === 'OWNER_CHANGED') {
            await prisma.lead.update({
                where: { id },
                data: { assignedToUserId: payload.newOwnerId }
            });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
    }
}
