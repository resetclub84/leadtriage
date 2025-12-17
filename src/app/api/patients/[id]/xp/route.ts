import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/patients/[id]/xp -> Retorna dados de XP do paciente
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const xp = await prisma.patientXP.findUnique({
            where: { patientId: id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10, // Últimas 10 transações
                },
            },
        });

        if (!xp) {
            // Se não existir, cria um inicial zerado
            const newXP = await prisma.patientXP.create({
                data: {
                    patientId: id,
                    totalXP: 0,
                    level: 'bronze',
                },
            });
            return NextResponse.json(newXP);
        }

        return NextResponse.json(xp);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar XP' }, { status: 500 });
    }
}

// POST /api/patients/[id]/xp -> Adiciona XP manualmente ou via sistema
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { amount, reason, metadata } = await req.json();

        let xp = await prisma.patientXP.findUnique({
            where: { patientId: id },
        });

        // Cria se não existir
        if (!xp) {
            xp = await prisma.patientXP.create({
                data: {
                    patientId: id,
                    totalXP: 0,
                    level: 'bronze',
                },
            });
        }

        // Calcula novo total e nível
        const newTotal = xp.totalXP + amount;
        let newLevel = xp.level;

        if (newTotal >= 500) newLevel = 'gold';
        else if (newTotal >= 100) newLevel = 'silver';
        else newLevel = 'bronze';

        // Atualiza XP e Nível
        const updatedXP = await prisma.patientXP.update({
            where: { id: xp.id },
            data: {
                totalXP: newTotal,
                level: newLevel,
            },
        });

        // Registra transação
        await prisma.xPTransaction.create({
            data: {
                xpId: xp.id,
                amount,
                reason,
                metadata: JSON.stringify(metadata || {}),
            },
        });

        return NextResponse.json({ success: true, xp: updatedXP });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao adicionar XP' }, { status: 500 });
    }
}
