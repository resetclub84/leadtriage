
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Injecting dummy protocol for testing...");
    const patient = await prisma.patient.findFirst({
        where: { accessCode: '123456' }
    });

    if (!patient) {
        console.error("Patient with code 123456 not found.");
        return;
    }

    const dummyProtocol = `
# 1. Estratégia Nutricional
A base da sua dieta será **low carb** com alto consumo de proteínas.

*   Café da manhã: Ovos e bacon.
*   Almoço: Carne e salada.

# 2. Treino
Foco em hipertrofia miofibrilar.

*   Segunda: Peito e Tríceps
*   Terça: Costas e Bíceps

# 3. Suplementação
Para otimizar sua recuperação:

1.  Creatina (5g/dia)
2.  Whey Protein (Pós-treino)
    `;

    await prisma.patient.update({
        where: { id: patient.id },
        data: { protocol: dummyProtocol }
    });

    console.log(`✅ Protocol injected for ${patient.name}`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
