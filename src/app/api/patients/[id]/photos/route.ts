import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/patients/[id]/photos - Listar fotos do paciente
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const photos = await prisma.patientPhoto.findMany({
            where: { patientId: id },
            orderBy: { createdAt: 'asc' }
        });

        // Organizar por tipo
        const before = photos.filter(p => p.type === 'BEFORE');
        const progress = photos.filter(p => p.type === 'PROGRESS');
        const after = photos.filter(p => p.type === 'AFTER');

        return NextResponse.json({
            photos,
            organized: { before, progress, after },
            total: photos.length
        });

    } catch (error) {
        console.error('Erro ao buscar fotos:', error);
        return NextResponse.json({ error: 'Erro ao buscar fotos' }, { status: 500 });
    }
}

// POST /api/patients/[id]/photos - Registrar nova foto
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

        // Buscar último check-in para pegar peso atual
        const lastCheckin = await prisma.patientCheckin.findFirst({
            where: { patientId: id },
            orderBy: { createdAt: 'desc' }
        });

        // Calcular semana do programa
        let weekNumber = null;
        if (patient.programStartDate) {
            const diffTime = Math.abs(new Date().getTime() - new Date(patient.programStartDate).getTime());
            weekNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        }

        const photo = await prisma.patientPhoto.create({
            data: {
                patientId: id,
                url: body.url,
                type: body.type || 'PROGRESS',
                angle: body.angle || null,
                weight: lastCheckin?.weight || null,
                weekNumber,
                canShare: body.canShare || false,
                isPublic: body.isPublic || false
            }
        });

        return NextResponse.json({
            success: true,
            photo,
            message: 'Foto registrada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao registrar foto:', error);
        return NextResponse.json({ error: 'Erro ao registrar foto' }, { status: 500 });
    }
}
