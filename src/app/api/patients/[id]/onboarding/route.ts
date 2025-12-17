import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: patientId } = await params;
        const data = await req.json();

        // Update patient with onboarding data
        const patient = await prisma.patient.update({
            where: { id: patientId },
            data: {
                gender: data.gender,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                height: data.height ? parseFloat(data.height.toString()) : null,
                fitnessLevel: data.fitnessLevel,
                trainingGoals: typeof data.trainingGoals === 'object' ? JSON.stringify(data.trainingGoals || []) : data.trainingGoals,
                nutritionGoals: data.nutritionGoals,
                initialWeight: data.weight ? parseFloat(data.weight.toString()) : null,
                programStartDate: new Date(),
                onboardingCompleted: true,
                // Generate unique access code for patient portal
                accessCode: generateAccessCode(),
            },
        });

        // Create initial XP record
        await prisma.patientXP.create({
            data: {
                patientId: patient.id,
                totalXP: 50, // Bonus for completing onboarding
                level: 'bronze',
            },
        });

        // Create XP transaction for onboarding completion
        const xp = await prisma.patientXP.findUnique({
            where: { patientId: patient.id },
        });

        if (xp) {
            await prisma.xPTransaction.create({
                data: {
                    xpId: xp.id,
                    amount: 50,
                    reason: 'onboarding_completed',
                    metadata: JSON.stringify({ completedAt: new Date() }),
                },
            });
        }

        return NextResponse.json({ success: true, patient });
    } catch (error) {
        console.error('Erro no onboarding:', error);
        return NextResponse.json(
            { error: 'Erro ao salvar dados do onboarding' },
            { status: 500 }
        );
    }
}

// Generate unique 6-digit access code for patient portal
function generateAccessCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
