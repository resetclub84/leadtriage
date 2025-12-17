
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Create a fresh test patient
        const patient = await prisma.patient.create({
            data: {
                name: 'Test Athlete',
                phone: '5511999999999',
                status: 'ATIVO',
                // We'll leave onboarding fields empty to test the wizard
            },
        });

        console.log(`Created patient with ID: ${patient.id}`);
    } catch (error) {
        console.error('Error creating patient:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
