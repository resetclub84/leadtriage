import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/patients/[id]/checkin - Registrar check-in do paciente
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();

        // Verificar se paciente existe
        const patient = await prisma.patient.findUnique({ where: { id } });
        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // Criar check-in
        const checkin = await prisma.patientCheckin.create({
            data: {
                patientId: id,
                weight: body.weight ? parseFloat(body.weight) : null,
                bodyFat: body.bodyFat ? parseFloat(body.bodyFat) : null,
                waist: body.waist ? parseFloat(body.waist) : null,
                hip: body.hip ? parseFloat(body.hip) : null,
                energyLevel: body.energyLevel ? parseInt(body.energyLevel) : null,
                sleepQuality: body.sleepQuality ? parseInt(body.sleepQuality) : null,
                moodScore: body.moodScore ? parseInt(body.moodScore) : null,
                adherenceScore: body.adherenceScore ? parseInt(body.adherenceScore) : null,
                wins: body.wins || null,
                challenges: body.challenges || null,
                notes: body.notes || null,
                source: body.source || 'WEB'
            }
        });

        // Verificar se atingiu algum milestone
        const milestones = await checkAndCreateMilestones(patient, checkin);

        // ADICIONAR XP PELO CHECK-IN (+10 XP)
        await addXP(patient.id, 10, 'checkin', { checkinId: checkin.id });

        // ADICIONAR XP POR MILESTONES (+50 XP cada)
        if (milestones.length > 0) {
            for (const m of milestones) {
                await addXP(patient.id, 50, 'milestone', { milestoneId: m.id, title: m.title });
            }
        }

        return NextResponse.json({
            success: true,
            checkin,
            milestones,
            message: milestones.length > 0
                ? `Check-in registrado! 🎉 +${10 + milestones.length * 50} XP e ${milestones.length} conquista(s)!`
                : 'Check-in registrado! +10 XP'
        });

    } catch (error) {
        console.error('Erro ao registrar check-in:', error);
        return NextResponse.json({ error: 'Erro ao registrar check-in' }, { status: 500 });
    }
}

// GET /api/patients/[id]/checkin - Listar check-ins
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const checkins = await prisma.patientCheckin.findMany({
            where: { patientId: id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(checkins);

    } catch (error) {
        console.error('Erro ao buscar check-ins:', error);
        return NextResponse.json({ error: 'Erro ao buscar check-ins' }, { status: 500 });
    }
}

// Função auxiliar para adicionar XP
async function addXP(patientId: string, amount: number, reason: string, metadata: any) {
    try {
        let xp = await prisma.patientXP.findUnique({ where: { patientId } });

        if (!xp) {
            xp = await prisma.patientXP.create({
                data: { patientId, totalXP: 0, level: 'bronze' }
            });
        }

        const newTotal = xp.totalXP + amount;
        let newLevel = xp.level;
        if (newTotal >= 500) newLevel = 'gold';
        else if (newTotal >= 100) newLevel = 'silver';

        await prisma.patientXP.update({
            where: { id: xp.id },
            data: { totalXP: newTotal, level: newLevel }
        });

        await prisma.xPTransaction.create({
            data: {
                xpId: xp.id,
                amount,
                reason,
                metadata: JSON.stringify(metadata)
            }
        });
    } catch (e) {
        console.error('Erro ao adicionar XP:', e);
    }
}

// Verificar e criar milestones automaticamente
async function checkAndCreateMilestones(patient: any, checkin: any) {
    const milestones: any[] = [];

    if (!patient.initialWeight || !checkin.weight) return milestones;

    const weightLoss = patient.initialWeight - checkin.weight;

    // Definir marcos de perda de peso
    const weightMilestones = [
        { kg: 3, title: 'Primeiros 3kg!', icon: '🌟', description: 'O início de uma grande transformação!' },
        { kg: 5, title: '5kg perdidos!', icon: '🔥', description: 'Você está no caminho certo!' },
        { kg: 10, title: '10kg de transformação!', icon: '💪', description: 'Uma conquista incrível!' },
        { kg: 15, title: '15kg! Impressionante!', icon: '🏆', description: 'Resultado excepcional!' },
        { kg: 20, title: '20kg! Você é inspiração!', icon: '👑', description: 'Uma nova pessoa surgiu!' },
        { kg: 25, title: '25kg! Lenda!', icon: '🦁', description: 'Resultado de atleta!' },
    ];

    for (const milestone of weightMilestones) {
        if (weightLoss >= milestone.kg) {
            // Verificar se já existe este milestone
            const existing = await prisma.patientMilestone.findFirst({
                where: {
                    patientId: patient.id,
                    type: 'WEIGHT_LOSS',
                    value: milestone.kg
                }
            });

            if (!existing) {
                const created = await prisma.patientMilestone.create({
                    data: {
                        patientId: patient.id,
                        type: 'WEIGHT_LOSS',
                        title: milestone.title,
                        description: milestone.description,
                        value: milestone.kg,
                        badgeIcon: milestone.icon
                    }
                });
                milestones.push(created);
            }
        }
    }

    // Milestone de consistência (10 check-ins)
    const checkinCount = await prisma.patientCheckin.count({
        where: { patientId: patient.id }
    });

    const consistencyMilestones = [
        { count: 10, title: '10 check-ins!', icon: '📊', description: 'Consistência é a chave!' },
        { count: 30, title: '30 check-ins!', icon: '🗓️', description: 'Um mês de compromisso!' },
        { count: 60, title: '60 check-ins!', icon: '⭐', description: 'Dois meses de disciplina!' },
        { count: 100, title: '100 check-ins!', icon: '💯', description: 'Disciplina de ferro!' },
    ];

    for (const milestone of consistencyMilestones) {
        if (checkinCount >= milestone.count) {
            const existing = await prisma.patientMilestone.findFirst({
                where: {
                    patientId: patient.id,
                    type: 'CONSISTENCY',
                    value: milestone.count
                }
            });

            if (!existing) {
                const created = await prisma.patientMilestone.create({
                    data: {
                        patientId: patient.id,
                        type: 'CONSISTENCY',
                        title: milestone.title,
                        description: milestone.description,
                        value: milestone.count,
                        badgeIcon: milestone.icon
                    }
                });
                milestones.push(created);
            }
        }
    }

    return milestones;
}
