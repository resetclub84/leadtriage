// Script para criar a clínica padrão
// Execute com: node scripts/seed-clinic.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🏥 Criando clínica padrão...');

    // Criar clínica
    const clinic = await prisma.clinic.upsert({
        where: { slug: 'clinica-reset' },
        update: {},
        create: {
            name: 'Clínica RESET',
            slug: 'clinica-reset',
            plan: 'PRO',
            isActive: true
        }
    });

    console.log('✅ Clínica criada:', clinic);

    // Atualizar dados existentes para pertencer a esta clínica
    const updateLeads = await prisma.lead.updateMany({
        where: { clinicId: null },
        data: { clinicId: clinic.id }
    });
    console.log(`✅ ${updateLeads.count} leads vinculados à clínica`);

    const updatePatients = await prisma.patient.updateMany({
        where: { clinicId: null },
        data: { clinicId: clinic.id }
    });
    console.log(`✅ ${updatePatients.count} pacientes vinculados à clínica`);

    const updatePlaybooks = await prisma.playbook.updateMany({
        where: { clinicId: null },
        data: { clinicId: clinic.id }
    });
    console.log(`✅ ${updatePlaybooks.count} playbooks vinculados à clínica`);

    // Atualizar ClinicConfig existente
    const existingConfig = await prisma.clinicConfig.findFirst({
        where: { clinicId: null }
    });

    if (existingConfig) {
        await prisma.clinicConfig.update({
            where: { id: existingConfig.id },
            data: { clinicId: clinic.id }
        });
        console.log('✅ Configuração de IA vinculada à clínica');
    }

    console.log('\n🎉 Done! Clínica configurada com sucesso.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
