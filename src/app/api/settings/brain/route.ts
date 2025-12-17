import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const config = await prisma.clinicConfig.findFirst({
        include: { clinic: true }
    });

    return NextResponse.json({
        id: config?.id,
        systemPrompt: config?.systemPrompt || '',
        knowledgeBase: config?.knowledgeBase || '',
        clinicName: config?.clinic?.name || 'Clínica RESET'
    });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { id, systemPrompt, knowledgeBase } = body;

    let config;
    if (id) {
        config = await prisma.clinicConfig.update({
            where: { id },
            data: { systemPrompt, knowledgeBase }
        });
    } else {
        const first = await prisma.clinicConfig.findFirst();
        if (first) {
            config = await prisma.clinicConfig.update({
                where: { id: first.id },
                data: { systemPrompt, knowledgeBase }
            });
        } else {
            config = await prisma.clinicConfig.create({
                data: { systemPrompt, knowledgeBase }
            });
        }
    }

    return NextResponse.json(config);
}
