
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFile, PATIENT_PHOTOS_BUCKET } from '@/lib/supabase';

// POST /api/portal/photos/upload - Upload de foto pelo portal do paciente
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const code = formData.get('code') as string;
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as string || 'PROGRESS';

        if (!code) {
            return NextResponse.json({ error: 'Código de acesso obrigatório' }, { status: 401 });
        }

        // Validar Paciente
        const patient = await prisma.patient.findUnique({
            where: { accessCode: code }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
        }

        if (!file) {
            return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 });
        }

        // Validar Imagem
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 });
        }

        // Tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
        }

        // Gerar nome único
        const id = patient.id;
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `${id}/${type.toLowerCase()}_${timestamp}_portal.${extension}`;

        // Converter buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload Supabase
        const { url, error: uploadError } = await uploadFile(
            PATIENT_PHOTOS_BUCKET,
            fileName,
            buffer,
            file.type
        );

        if (uploadError || !url) {
            console.error('Erro no upload Supabase:', uploadError);
            return NextResponse.json({ error: 'Falha no armazenamento da imagem' }, { status: 500 });
        }

        // Buscar último check-in para peso (opcional)
        const lastCheckin = await prisma.patientCheckin.findFirst({
            where: { patientId: id },
            orderBy: { createdAt: 'desc' }
        });

        // Salvar metadata no banco
        const photo = await prisma.patientPhoto.create({
            data: {
                patientId: id,
                url,
                type,
                angle: 'SELFIE', // Default for portal uploads
                weight: lastCheckin?.weight || null,
                canShare: false,
                isPublic: false
            }
        });

        // Gamification: Adicionar XP se for a primeira foto da semana?
        // Simples por enquanto: +20 XP por foto
        // (Futuro: Implementar lógica de XP)

        return NextResponse.json({
            success: true,
            photo,
            message: 'Foto enviada com sucesso!'
        });

    } catch (error) {
        console.error('Erro no endpoint de upload:', error);
        return NextResponse.json({ error: 'Erro interno ao processar upload' }, { status: 500 });
    }
}
