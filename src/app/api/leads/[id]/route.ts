import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                triage: true,
                events: { orderBy: { createdAt: 'desc' } },
                assignedTo: { select: { id: true, name: true } }
            },
        });
        if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const body = await req.json();
        const lead = await prisma.lead.update({
            where: { id },
            data: body
        });
        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
