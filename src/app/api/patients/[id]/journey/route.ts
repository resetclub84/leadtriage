import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/patients/[id]/journey - Buscar jornada completa do paciente
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                checkins: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                photos: {
                    orderBy: { createdAt: 'asc' }
                },
                milestones: {
                    orderBy: { achievedAt: 'desc' }
                },
                appointments: {
                    orderBy: { date: 'desc' },
                    take: 10
                },
                referralsSent: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // Calcular métricas de progresso
        const metrics = calculateProgressMetrics(patient);

        return NextResponse.json({
            patient,
            metrics,
            timeline: buildTimeline(patient)
        });

    } catch (error) {
        console.error('Erro ao buscar jornada:', error);
        return NextResponse.json({ error: 'Erro ao buscar jornada' }, { status: 500 });
    }
}

// Calcular métricas de progresso
function calculateProgressMetrics(patient: any) {
    const checkins = patient.checkins || [];
    
    if (checkins.length === 0 || !patient.initialWeight) {
        return {
            totalWeightLoss: 0,
            currentWeight: patient.initialWeight || 0,
            progressPercentage: 0,
            avgEnergy: 0,
            avgSleep: 0,
            avgAdherence: 0,
            totalCheckins: 0,
            streak: 0
        };
    }

    const latestCheckin = checkins[0];
    const currentWeight = latestCheckin?.weight || patient.initialWeight;
    const totalWeightLoss = patient.initialWeight - currentWeight;
    
    // Progresso em direção à meta
    const goalDiff = patient.initialWeight - (patient.goalWeight || patient.initialWeight);
    const progressPercentage = goalDiff > 0 ? Math.min((totalWeightLoss / goalDiff) * 100, 100) : 0;

    // Médias subjetivas
    const avgEnergy = checkins.filter((c: any) => c.energyLevel).reduce((acc: number, c: any) => acc + c.energyLevel, 0) / (checkins.filter((c: any) => c.energyLevel).length || 1);
    const avgSleep = checkins.filter((c: any) => c.sleepQuality).reduce((acc: number, c: any) => acc + c.sleepQuality, 0) / (checkins.filter((c: any) => c.sleepQuality).length || 1);
    const avgAdherence = checkins.filter((c: any) => c.adherenceScore).reduce((acc: number, c: any) => acc + c.adherenceScore, 0) / (checkins.filter((c: any) => c.adherenceScore).length || 1);

    // Calcular streak (dias consecutivos)
    let streak = 0;
    const sortedCheckins = [...checkins].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    for (let i = 0; i < sortedCheckins.length; i++) {
        const current = new Date(sortedCheckins[i].createdAt);
        const expected = new Date();
        expected.setDate(expected.getDate() - i);
        
        if (current.toDateString() === expected.toDateString()) {
            streak++;
        } else {
            break;
        }
    }

    return {
        totalWeightLoss: Math.round(totalWeightLoss * 10) / 10,
        currentWeight: Math.round(currentWeight * 10) / 10,
        progressPercentage: Math.round(progressPercentage),
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgSleep: Math.round(avgSleep * 10) / 10,
        avgAdherence: Math.round(avgAdherence * 10) / 10,
        totalCheckins: checkins.length,
        streak
    };
}

// Construir timeline unificada
function buildTimeline(patient: any) {
    const events: any[] = [];

    // Adicionar check-ins
    (patient.checkins || []).forEach((checkin: any) => {
        events.push({
            type: 'CHECKIN',
            date: checkin.createdAt,
            data: checkin
        });
    });

    // Adicionar fotos
    (patient.photos || []).forEach((photo: any) => {
        events.push({
            type: 'PHOTO',
            date: photo.createdAt,
            data: photo
        });
    });

    // Adicionar milestones
    (patient.milestones || []).forEach((milestone: any) => {
        events.push({
            type: 'MILESTONE',
            date: milestone.achievedAt,
            data: milestone
        });
    });

    // Adicionar consultas
    (patient.appointments || []).forEach((apt: any) => {
        events.push({
            type: 'APPOINTMENT',
            date: apt.date,
            data: apt
        });
    });

    // Ordenar por data (mais recente primeiro)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
