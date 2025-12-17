import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    const playbooks = await prisma.playbook.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(playbooks);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const playbook = await prisma.playbook.create({
            data: {
                title: body.title,
                intent: body.intent,
                program: body.program,
                templateText: body.templateText,
                objectionTag: body.objectionTag
            }
        });
        return NextResponse.json(playbook);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create playbook' }, { status: 500 });
    }
}
