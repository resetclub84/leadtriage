import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 });
        }

        const patient = await prisma.patient.findUnique({
            where: { accessCode: code },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
        }

        // Retorna sucesso (o cliente redireciona)
        // Em um app real, aqui geraríamos um token JWT de sessão
        return NextResponse.json({ success: true, patientId: patient.id });
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
