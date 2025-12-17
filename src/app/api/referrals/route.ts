import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/referrals - Dashboard de todas as indicações
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        // Buscar todas as referrals com dados do referrer
        const referrals = await prisma.referral.findMany({
            include: {
                referrer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calcular estatísticas
        const stats = {
            total: referrals.length,
            invited: referrals.filter(r => r.status === 'INVITED').length,
            clicked: referrals.filter(r => r.clickedAt !== null).length,
            leads: referrals.filter(r => r.status === 'LEAD').length,
            scheduled: referrals.filter(r => r.status === 'SCHEDULED').length,
            converted: referrals.filter(r => r.status === 'CONVERTED').length,
            conversionRate: referrals.length > 0
                ? Math.round((referrals.filter(r => r.status === 'CONVERTED').length / referrals.length) * 100)
                : 0
        };

        // Top referrers
        const referrerStats = referrals.reduce((acc: any, r) => {
            const key = r.referrerId;
            if (!acc[key]) {
                acc[key] = {
                    patient: r.referrer,
                    total: 0,
                    converted: 0
                };
            }
            acc[key].total++;
            if (r.status === 'CONVERTED') acc[key].converted++;
            return acc;
        }, {});

        const topReferrers = Object.values(referrerStats)
            .sort((a: any, b: any) => b.converted - a.converted || b.total - a.total)
            .slice(0, 10);

        return NextResponse.json({
            referrals,
            stats,
            topReferrers
        });

    } catch (error) {
        console.error('Erro ao buscar referrals:', error);
        return NextResponse.json({ error: 'Erro ao buscar indicações' }, { status: 500 });
    }
}
