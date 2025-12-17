
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const playbooks = [
    {
        "title": "Primeira Resposta & Qualificação",
        "intent": "MAIS_INFORMACOES",
        "program": "GENERIC",
        "templateText": "Olá. Obrigado pelo contato. Para confirmarmos se nossa metodologia é a ideal para o seu momento, por favor me informe: seu objetivo principal hoje é performance, estética ou saúde preventiva?"
    },
    {
        "title": "Resposta Vaga (Oi)",
        "intent": "MAIS_INFORMACOES",
        "program": "GENERIC",
        "templateText": "Olá. Sou a assistente da clínica. Como posso auxiliar hoje em sua jornada de saúde e performance?"
    },
    {
        "title": "Agendamento Direto (Lead Quente)",
        "intent": "AGENDAR_CONSULTA",
        "program": "GENERIC",
        "templateText": "Perfeito. O próximo passo é a consulta de avaliação para desenharmos seu protocolo individualizado. Temos disponibilidade para esta semana. Prefere horários pela manhã ou tarde?"
    },
    {
        "title": "Objeção: Falta de Tempo",
        "intent": "AGENDAR_CONSULTA",
        "program": "GENERIC",
        "templateText": "Compreendo sua rotina. Nossos protocolos são desenhados justamente para otimizar seu tempo e energia, presencialmente ou via telemedicina. Podemos agendar uma avaliação de 30 minutos para explicar a dinâmica?"
    },
    {
        "title": "Objeção: Frustração Anterior",
        "intent": "MAIS_INFORMACOES",
        "program": "RESET",
        "templateText": "Entendo. Muitos pacientes chegam com essa experiência. A diferença do programa RESET é que não usamos fórmulas prontas; partimos de sua bioquímica individual. Gostaria de agendar a avaliação para entender o que faltou nas tentativas anteriores?"
    },
    {
        "title": "Objeção: Medo (Segurança)",
        "intent": "MAIS_INFORMACOES",
        "program": "GENERIC",
        "templateText": "Sua segurança é inegociável. Não realizamos prescrições sem análise laboratorial completa e indicação clínica precisa. O foco é longevidade com responsabilidade. Podemos agendar sua consulta para discutir isso diretamente com o médico?"
    },
    {
        "title": "Pergunta de Preço (Valor)",
        "intent": "MAIS_INFORMACOES",
        "program": "GENERIC",
        "templateText": "O investimento varia conforme o protocolo personalizado definido na consulta médica (duração mínima de 5 meses). O foco agora é validar se somos a solução correta para você. Podemos seguir com o agendamento da avaliação inicial?"
    },
    {
        "title": "Follow-up 24-48h (Ausente)",
        "intent": "MAIS_INFORMACOES",
        "program": "GENERIC",
        "templateText": "Olá. Ainda temos interesse em acompanhar seu caso. Restou alguma dúvida sobre nossa metodologia ou gostaria de verificar a disponibilidade de agenda para esta semana?"
    },
    {
        "title": "Reativação 7-14d (Frio)",
        "intent": "MAIS_INFORMACOES",
        "program": "Slim_2026",
        "templateText": "Olá. Estamos finalizando a agenda do mês e abrimos vagas remanescentes para o programa Slim_2026. Cuidar da sua composição corporal e saúde ainda é uma prioridade para você agora?"
    },
    {
        "title": "Handoff para Humano (Sensível)",
        "intent": "MAIS_INFORMACOES",
        "program": "GENERIC",
        "templateText": "Compreendo a especificidade do seu caso e quero garantir a melhor orientação. Vou transferir esta conversa para um de nossos consultores sênior. Por favor, aguarde um momento."
    }
];

async function main() {
    console.log('Start seeding premium playbooks...');

    for (const pb of playbooks) {
        const existing = await prisma.playbook.findFirst({ where: { title: pb.title } });
        if (!existing) {
            await prisma.playbook.create({ data: pb });
            console.log(`Created playbook: ${pb.title}`);
        } else {
            console.log(`Skipped existing: ${pb.title}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
