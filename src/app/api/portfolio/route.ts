import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/portfolio - Dashboard de resultados agregados (Proof Portfolio)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        // Buscar todos os pacientes com seus dados
        const patients = await prisma.patient.findMany({
            include: {
                checkins: {
                    orderBy: { createdAt: 'desc' },
                    take: 1 // Último check-in
                },
                milestones: true,
                photos: {
                    where: { canShare: true }
                }
            }
        });

        // Calcular estatísticas agregadas
        let totalWeightLoss = 0;
        let patientsWithProgress = 0;
        let totalMilestones = 0;
        let successStories: any[] = [];

        patients.forEach(patient => {
            if (patient.initialWeight && patient.checkins.length > 0) {
                const currentWeight = patient.checkins[0].weight;
                if (currentWeight && patient.initialWeight > currentWeight) {
                    const loss = patient.initialWeight - currentWeight;
                    totalWeightLoss += loss;
                    patientsWithProgress++;

                    // Adicionar a success stories se perdeu mais de 5kg
                    if (loss >= 5) {
                        successStories.push({
                            id: patient.id,
                            name: patient.name,
                            initialWeight: patient.initialWeight,
                            currentWeight,
                            weightLoss: Math.round(loss * 10) / 10,
                            milestones: patient.milestones.length,
                            hasPhotos: patient.photos.length > 0,
                            programStart: patient.programStartDate
                        });
                    }
                }
            }
            totalMilestones += patient.milestones.length;
        });

        // Ordenar success stories por peso perdido
        successStories.sort((a, b) => b.weightLoss - a.weightLoss);

        // Estatísticas gerais
        const stats = {
            totalPatients: patients.length,
            patientsWithProgress,
            totalWeightLoss: Math.round(totalWeightLoss * 10) / 10,
            avgWeightLoss: patientsWithProgress > 0 ? Math.round((totalWeightLoss / patientsWithProgress) * 10) / 10 : 0,
            totalMilestones,
            successStoriesCount: successStories.length
        };

        // Distribuição de resultados
        const distribution = {
            under5kg: successStories.filter(s => s.weightLoss < 5).length,
            from5to10kg: successStories.filter(s => s.weightLoss >= 5 && s.weightLoss < 10).length,
            from10to15kg: successStories.filter(s => s.weightLoss >= 10 && s.weightLoss < 15).length,
            from15to20kg: successStories.filter(s => s.weightLoss >= 15 && s.weightLoss < 20).length,
            over20kg: successStories.filter(s => s.weightLoss >= 20).length
        };

        // Milestones recentes
        const recentMilestones = await prisma.patientMilestone.findMany({
            orderBy: { achievedAt: 'desc' },
            take: 10,
            include: {
                patient: {
                    select: { id: true, name: true }
                }
            }
        });

        return NextResponse.json({
            stats,
            distribution,
            successStories: successStories.slice(0, 10),
            recentMilestones
        });

    } catch (error) {
        console.error('Erro ao buscar portfolio:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}
