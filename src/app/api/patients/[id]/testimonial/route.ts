import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/patients/[id]/testimonial - Buscar depoimentos do paciente
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        // Buscar milestones com depoimentos
        const milestones = await prisma.patientMilestone.findMany({
            where: {
                patientId: id,
                NOT: { testimonial: null }
            },
            orderBy: { achievedAt: 'desc' }
        });

        return NextResponse.json({
            testimonials: milestones.map(m => ({
                id: m.id,
                milestone: m.title,
                text: m.testimonial,
                canPublish: m.canShareTestimonial,
                date: m.achievedAt
            })),
            total: milestones.length
        });

    } catch (error) {
        console.error('Erro ao buscar depoimentos:', error);
        return NextResponse.json({ error: 'Erro ao buscar depoimentos' }, { status: 500 });
    }
}

// POST /api/patients/[id]/testimonial - Adicionar depoimento a um milestone
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const { milestoneId, testimonial, canPublish } = body;

        if (!milestoneId || !testimonial) {
            return NextResponse.json({ error: 'Milestone e depoimento são obrigatórios' }, { status: 400 });
        }

        // Verificar se milestone existe e pertence ao paciente
        const milestone = await prisma.patientMilestone.findFirst({
            where: {
                id: milestoneId,
                patientId: id
            }
        });

        if (!milestone) {
            return NextResponse.json({ error: 'Conquista não encontrada' }, { status: 404 });
        }

        // Atualizar milestone com depoimento
        const updated = await prisma.patientMilestone.update({
            where: { id: milestoneId },
            data: {
                testimonial,
                canShareTestimonial: canPublish || false
            }
        });

        return NextResponse.json({
            success: true,
            milestone: updated,
            message: 'Depoimento registrado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao registrar depoimento:', error);
        return NextResponse.json({ error: 'Erro ao registrar depoimento' }, { status: 500 });
    }
}
