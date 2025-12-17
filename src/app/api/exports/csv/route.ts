import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(req: Request) {
    try {
        const leads = await prisma.lead.findMany({
            include: { triage: true },
            orderBy: { createdAt: 'desc' }
        });

        const csv = Papa.unparse(leads.map(l => ({
            id: l.id,
            date: l.createdAt,
            name: l.name,
            phone: l.phone,
            status: l.status,
            intent: l.triage?.intent,
            score: l.triage?.lead_score,
            program: l.triage?.indicacao_programa
        })));

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=leads-export.csv'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
