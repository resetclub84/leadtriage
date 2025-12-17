import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;

    try {
        const leads = await prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { triage: true }
        });
        return NextResponse.json(leads);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}
