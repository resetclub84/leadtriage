
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Setting access code for Test Athlete...");
    const patient = await prisma.patient.findFirst({
        where: { name: 'Test Athlete' }
    });

    if (!patient) {
        console.error("Test Athlete not found. Run create-test-patient first.");
        return;
    }

    await prisma.patient.update({
        where: { id: patient.id },
        data: { accessCode: '123456' }
    });

    console.log(`✅ Success! Access Code '123456' set for patient ${patient.name} (${patient.id})`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
