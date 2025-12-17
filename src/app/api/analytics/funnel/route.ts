import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        // Total de leads
        const totalLeads = await prisma.lead.count();

        // Leads novos (últimos 7 dias)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newLeads = await prisma.lead.count({
            where: { createdAt: { gte: sevenDaysAgo } }
        });

        // Qualificados (score alto) - usando TriageResult corretamente
        const triageResults = await prisma.triageResult.findMany({
            where: { lead_score: 'alto' },
            select: { leadId: true },
            distinct: ['leadId']
        });
        const qualified = triageResults.length;

        // Agendados (status AGENDADO)
        const scheduled = await prisma.lead.count({
            where: { status: 'AGENDADO' }
        });

        // Pagamentos confirmados
        const paid = await prisma.payment.count({
            where: { status: 'COMPLETED' }
        });

        // Receita total
        const payments = await prisma.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const totalRevenue = (payments._sum.amount || 0) / 100;

        // Taxa de conversão
        const conversionRate = totalLeads > 0 ? scheduled / totalLeads : 0;

        // Tempo médio de resposta (hardcoded por enquanto)
        const avgResponseTime = 4;

        return NextResponse.json({
            totalLeads,
            newLeads,
            qualified,
            scheduled,
            paid,
            conversionRate,
            avgResponseTime,
            totalRevenue
        });
    } catch (error) {
        console.error('Erro no Analytics:', error);
        return NextResponse.json({ error: 'Erro ao buscar analytics' }, { status: 500 });
    }
}
