
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧠 Seeding Initial AI Brain Configuration...');

    const initialConfig = {
        clinicName: "Clínica Dr. Matheus (LeadTriage)",
        systemPrompt: `VOCÊ É: Especialista de Admissão da Clínica Dr. Matheus.
OBJETIVO: Agendar uma CONSULTA DE AVALIAÇÃO.
TOM: Empático e seguro.`,
        knowledgeBase: `1. PROGRAMA RESET (5 meses): Desinflamação e Longevidade.
2. SLIM 2026: Estética Rápida.
VALORES: A partir de R$ X (depende da avaliação).`
    };

    // Upsert (Create if not exists)
    const existing = await prisma.clinicConfig.findFirst();
    if (!existing) {
        await prisma.clinicConfig.create({ data: initialConfig });
        console.log('✅ Created default Clinic Configuration.');
    } else {
        console.log('ℹ️  Configuration already exists. Skipping overwrite.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
