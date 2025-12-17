import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/patients/[id]/baseline - Atualizar dados baseline do paciente
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                initialWeight: body.initialWeight ? parseFloat(body.initialWeight) : undefined,
                initialBodyFat: body.initialBodyFat ? parseFloat(body.initialBodyFat) : undefined,
                goalWeight: body.goalWeight ? parseFloat(body.goalWeight) : undefined,
                programStartDate: body.programStartDate ? new Date(body.programStartDate) : undefined,
                programEndDate: body.programEndDate ? new Date(body.programEndDate) : undefined
            }
        });

        return NextResponse.json({
            success: true,
            patient,
            message: 'Dados baseline atualizados com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao atualizar baseline:', error);
        return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
    }
}
