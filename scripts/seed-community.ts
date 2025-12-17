
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Community Feed...');

    // 1. Create fake patients
    const patients = [
        { name: 'Ana Souza', city: 'São Paulo', state: 'SP' },
        { name: 'Carlos Lima', city: 'Rio de Janeiro', state: 'RJ' },
        { name: 'Roberto Santos', city: 'Curitiba', state: 'PR' },
        { name: 'Julia Martins', city: 'Belo Horizonte', state: 'MG' },
    ];

    for (const p of patients) {
        const patient = await prisma.patient.create({
            data: {
                name: p.name,
                phone: `5511999${Math.floor(Math.random() * 100000)}`, // Dummy phone
                city: p.city,
                state: p.state,
                status: 'ATIVO',
            }
        });

        // 2. Create milestones for them
        await prisma.patientMilestone.createMany({
            data: [
                {
                    patientId: patient.id,
                    type: 'WEIGHT_LOSS',
                    title: 'Perdeu 5kg! 🔥',
                    description: 'Muito feliz com o resultado em 30 dias.',
                    badgeIcon: '⚖️',
                    achievedAt: new Date(Date.now() - Math.random() * 86400000 * 5), // last 5 days
                },
                {
                    patientId: patient.id,
                    type: 'CONSISTENCY',
                    title: '15 Dias Seguidos',
                    description: 'Foco total no plano alimentar.',
                    badgeIcon: '📅',
                    achievedAt: new Date(Date.now() - Math.random() * 86400000 * 2), // last 2 days
                }
            ]
        });
    }

    console.log('✅ Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
