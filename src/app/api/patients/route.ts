import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/patients - Lista todos os pacientes
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const patients = await prisma.patient.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                lead: {
                    select: { id: true, source: true, createdAt: true }
                },
                _count: {
                    select: { appointments: true }
                }
            }
        });

        return NextResponse.json(patients);
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

// POST /api/patients - Criar novo paciente
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const body = await req.json();
        const { name, phone, email, cpf, birthDate, address, city, state, notes, leadId } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 });
        }

        // Verificar se já existe paciente com este telefone
        const existing = await prisma.patient.findUnique({ where: { phone } });
        if (existing) {
            return NextResponse.json({ error: 'Já existe paciente com este telefone' }, { status: 400 });
        }

        // Criar paciente
        const patient = await prisma.patient.create({
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
                leadId
            }
        });

        // Se veio de lead, atualizar status do lead
        if (leadId) {
            await prisma.lead.update({
                where: { id: leadId },
                data: { status: 'CONVERTED' }
            });

            // Registrar evento
            await prisma.eventLog.create({
                data: {
                    leadId,
                    type: 'CONVERTED_TO_PATIENT',
                    payload: JSON.stringify({ patientId: patient.id })
                }
            });
        }

        return NextResponse.json(patient, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar paciente:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
