import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateProtocol } from '@/lib/gemini';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: patientId } = await params;

        // 1. Fetch Patient Data with safety checks
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // 2. Prepare Data for AI
        // Calculate age helper
        const calculateAge = (birthDate: Date | null) => {
            if (!birthDate) return 30; // Default generic age
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // Parse goals safely
        let trainingGoals = [];
        try {
            if (patient.trainingGoals) {
                // If it's already an array, use it. If string, parse it.
                // Prisma schema says String, but practice might have varied.
                // Our Onboarding API saves it as JSON.stringify data.
                trainingGoals = JSON.parse(patient.trainingGoals);
            }
        } catch (e) {
            trainingGoals = [patient.trainingGoals || "Geral"];
        }

        const patientData = {
            name: patient.name,
            age: calculateAge(patient.birthDate),
            gender: patient.gender || 'Não informado',
            weight: patient.initialWeight || 70,
            height: patient.height || 170,
            fitnessLevel: patient.fitnessLevel || 'Iniciante',
            trainingGoals: Array.isArray(trainingGoals) ? trainingGoals : [String(trainingGoals)],
            nutritionGoals: patient.nutritionGoals || 'Saúde Geral'
        };

        // 3. Call AI Service
        const markdownProtocol = await generateProtocol(patientData);

        // 4. Return result (Don't save yet, User must review)
        return NextResponse.json({
            success: true,
            protocol: markdownProtocol
        });

    } catch (error) {
        console.error('Erro ao gerar protocolo:', error);
        return NextResponse.json(
            { error: 'Falha ao processar inteligência artificial' },
            { status: 500 }
        );
    }
}
