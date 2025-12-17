import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile, PATIENT_PHOTOS_BUCKET } from '@/lib/supabase';

// POST /api/patients/[id]/photos/upload - Upload de foto do paciente
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as string || 'PROGRESS';
        const angle = formData.get('angle') as string || 'FRONT';
        const canShare = formData.get('canShare') === 'true';

        if (!file) {
            return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 });
        }

        // Verificar se é uma imagem
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 });
        }

        // Verificar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
        }

        // Verificar se paciente existe
        const patient = await prisma.patient.findUnique({ where: { id } });
        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `${id}/${type.toLowerCase()}_${timestamp}.${extension}`;

        // Converter File para Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload para Supabase Storage
        const { url, error: uploadError } = await uploadFile(
            PATIENT_PHOTOS_BUCKET,
            fileName,
            buffer,
            file.type
        );

        if (uploadError || !url) {
            console.error('Erro no upload:', uploadError);
            return NextResponse.json({
                error: uploadError || 'Erro ao fazer upload da imagem'
            }, { status: 500 });
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

        // Salvar registro da foto no banco
        const photo = await prisma.patientPhoto.create({
            data: {
                patientId: id,
                url,
                type,
                angle,
                weight: lastCheckin?.weight || null,
                weekNumber,
                canShare,
                isPublic: false
            }
        });

        return NextResponse.json({
            success: true,
            photo,
            message: 'Foto enviada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao processar upload:', error);
        return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 });
    }
}
