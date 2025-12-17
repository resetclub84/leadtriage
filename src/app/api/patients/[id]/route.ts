import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/patients/[id] - Detalhes do paciente
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                lead: {
                    include: {
                        triage: true,
                        events: { orderBy: { createdAt: 'desc' }, take: 10 }
                    }
                },
                appointments: {
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        return NextResponse.json(patient);
    } catch (error) {
        console.error('Erro ao buscar paciente:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

// PUT /api/patients/[id] - Atualizar paciente
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const { name, phone, email, cpf, birthDate, address, city, state, notes, status } = body;

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                name,
                phone,
                email,
                cpf,
                birthDate: birthDate ? new Date(birthDate) : null,
                address,
                city,
                state,
                notes,
                status
            }
        });

        return NextResponse.json(patient);
    } catch (error) {
        console.error('Erro ao atualizar paciente:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

// DELETE /api/patients/[id] - Excluir paciente
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        await prisma.patient.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
