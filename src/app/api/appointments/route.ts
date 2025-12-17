import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/appointments - Lista consultas
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                ...(patientId && { patientId }),
                ...(status && { status })
            },
            orderBy: { date: 'desc' },
            include: {
                patient: {
                    select: { id: true, name: true, phone: true }
                }
            }
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

// POST /api/appointments - Criar consulta
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const body = await req.json();
        const { patientId, date, type, notes } = body;

        if (!patientId || !date) {
            return NextResponse.json({ error: 'Paciente e data são obrigatórios' }, { status: 400 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                date: new Date(date),
                type: type || 'CONSULTA',
                notes
            }
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar consulta:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
