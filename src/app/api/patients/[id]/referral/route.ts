import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nanoid } from 'nanoid';

// GET /api/patients/[id]/referral - Buscar dados de referral do paciente
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                referralsSent: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // Gerar código de referral se não existir
        let referralCode = patient.referralCode;
        if (!referralCode) {
            referralCode = nanoid(8).toUpperCase();
            await prisma.patient.update({
                where: { id },
                data: { referralCode }
            });
        }

        // Calcular estatísticas
        const stats = {
            totalInvites: patient.referralsSent.length,
            totalClicks: patient.referralsSent.filter((r: any) => r.clickedAt).length,
            totalLeads: patient.referralsSent.filter((r: any) => r.status === 'LEAD' || r.status === 'SCHEDULED' || r.status === 'CONVERTED').length,
            totalConverted: patient.referralsSent.filter((r: any) => r.status === 'CONVERTED').length,
            pendingRewards: patient.referralsSent.filter((r: any) => r.status === 'CONVERTED' && !r.rewardGiven).length
        };

        // Gerar link de indicação
        const referralLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/r/${referralCode}`;

        return NextResponse.json({
            referralCode,
            referralLink,
            stats,
            referrals: patient.referralsSent
        });

    } catch (error) {
        console.error('Erro ao buscar referrals:', error);
        return NextResponse.json({ error: 'Erro ao buscar referrals' }, { status: 500 });
    }
}

// POST /api/patients/[id]/referral - Criar nova indicação
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const { name, phone, email } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 });
        }

        // Verificar se paciente existe
        const patient = await prisma.patient.findUnique({ where: { id } });
        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // Verificar se já existe indicação para este telefone
        const existing = await prisma.referral.findFirst({
            where: {
                referrerId: id,
                referredPhone: phone
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Você já indicou esta pessoa' }, { status: 400 });
        }

        // Criar indicação
        const referral = await prisma.referral.create({
            data: {
                referrerId: id,
                referredName: name,
                referredPhone: phone,
                referredEmail: email || null,
                status: 'INVITED'
            }
        });

        return NextResponse.json({
            success: true,
            referral,
            message: 'Indicação registrada! Vamos entrar em contato com seu amigo(a).'
        });

    } catch (error) {
        console.error('Erro ao criar referral:', error);
        return NextResponse.json({ error: 'Erro ao criar indicação' }, { status: 500 });
    }
}
