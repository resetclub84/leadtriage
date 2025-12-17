
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🛡️  Starting SAFE Production Seed...');

    // 1. Check if Admin User exists
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@leadtriage.com' } });
    if (!adminExists) {
        await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@leadtriage.com',
                password: 'admin', // In production, user should change this immediately
                role: 'ADMIN'
            }
        });
        console.log('✅ Created initial Admin User.');
    } else {
        console.log('ℹ️  Admin User already exists. Skipping.');
    }

    // 2. Import Playbooks (Always safe to upsert)
    // Minimal set of Critical Playbooks
    const playbooks = [
        {
            "title": "Primeira Resposta & Qualificação",
            "intent": "MAIS_INFORMACOES",
            "templateText": "Olá. Obrigado pelo contato. Para confirmarmos se nossa metodologia é a ideal para o seu momento, por favor me informe: seu objetivo principal hoje é performance, estética ou saúde preventiva?"
        },
        {
            "title": "Agendamento Direto",
            "intent": "AGENDAR_CONSULTA",
            "templateText": "Perfeito. O próximo passo é a consulta de avaliação. Temos disponibilidade para esta semana. Prefere horários pela manhã ou tarde?"
        }
    ];

    for (const pb of playbooks) {
        const existing = await prisma.playbook.findFirst({ where: { title: pb.title } });
        if (!existing) {
            await prisma.playbook.create({ data: pb });
            console.log(`✅ Created playbook: ${pb.title}`);
        } else {
            console.log(`ℹ️  Playbook '${pb.title}' already exists.`);
        }
    }

    console.log('🏁 Production Seed Finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
