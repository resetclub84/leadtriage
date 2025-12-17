
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🛡️  Starting SAFE Production Seed (JS Mode)...');

    // 1. Check if Admin User exists
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@leadtriage.com' } });
    if (!adminExists) {
        await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@leadtriage.com',
                password: 'admin',
                role: 'ADMIN'
            }
        });
        console.log('✅ Created initial Admin User.');
    } else {
        console.log('ℹ️  Admin User already exists.');
        // Force update password just in case
        await prisma.user.update({
            where: { email: 'admin@leadtriage.com' },
            data: { password: 'admin' }
        });
        console.log('✅ Admin password reset to "admin".');
    }

    // 2. Playbooks
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
