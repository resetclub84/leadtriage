import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/patients/[id]/protocol -> Returns stored protocol
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const patient = await prisma.patient.findUnique({
            where: { id },
            select: { protocol: true }
        });

        if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

        return NextResponse.json({ protocol: patient.protocol });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching protocol' }, { status: 500 });
    }
}

// PUT /api/patients/[id]/protocol -> Updates stored protocol
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { protocol } = await req.json();

        const patient = await prisma.patient.update({
            where: { id },
            data: { protocol }
        });

        return NextResponse.json({ success: true, patient });
    } catch (error) {
        return NextResponse.json({ error: 'Error saving protocol' }, { status: 500 });
    }
}
