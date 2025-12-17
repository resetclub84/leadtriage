
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando seed com Playbooks Premium...')

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@leadtriage.com' },
        update: {},
        create: {
            email: 'admin@leadtriage.com',
            name: 'Dr. Admin',
            password: 'admin',
            role: 'ADMIN',
        },
    })

    const staff = await prisma.user.upsert({
        where: { email: 'staff@leadtriage.com' },
        update: {},
        create: {
            email: 'staff@leadtriage.com',
            name: 'Ana Recepcionista',
            password: 'staff',
            role: 'STAFF',
        },
    })

    console.log(`✅ Usuários: ${admin.name}, ${staff.name}`)

    // 2. Delete existing playbooks to avoid duplicates
    await prisma.playbook.deleteMany({})
    console.log('🗑️  Limpando playbooks antigos...')

    // 3. Create PREMIUM Playbooks (12 templates)
    const playbooks = [
        // QUALIFICAÇÃO INICIAL
        {
            title: "Boas-vindas (Saudação Genérica)",
            intent: "MAIS_INFORMACOES",
            program: null,
            templateText: "Olá! Bem-vindo à nossa clínica 👋 Estamos aqui para transformar sua saúde de forma sustentável. Me conte: você busca performance esportiva, emagrecimento ou longevidade ativa?"
        },
        {
            title: "Pergunta sobre Preço (Sem Contexto)",
            intent: "MAIS_INFORMACOES",
            objectionTag: "preco",
            program: null,
            templateText: "Ótima pergunta! Nossos programas variam conforme o protocolo médico (exames, suplementação, acompanhamento). Para te dar um valor exato, preciso entender: qual seu objetivo principal? (emagrecimento/hipertrofia/saúde preventiva)"
        },
        {
            title: "Interesse em Emagrecimento",
            intent: "AGENDAR_CONSULTA",
            program: "Slim 2026",
            templateText: "Perfeito! O Slim 2026 é nosso protocolo intensivo de 90 dias com abordagem médica 🎯 (nada de dietas restritivas). Você tem algum evento ou meta específica em mente?"
        },
        {
            title: "Interesse em Performance/Hipertrofia",
            intent: "AGENDAR_CONSULTA",
            program: "RESET",
            templateText: "🔥 Excelente! Nosso RESET é focado em otimização hormonal + nutrição estratégica para ganho de massa. Você treina quantas vezes por semana atualmente?"
        },

        // OBJEÇÕES
        {
            title: "Objeção: \"Está Muito Caro\"",
            intent: "MAIS_INFORMACOES",
            objectionTag: "preco",
            program: null,
            templateText: "Entendo perfeitamente! Vamos olhar por outro ângulo: quanto você já investiu em academias/nutris nos últimos 2 anos sem resultado? Nosso RESET tem taxa de sucesso de 94%. Que tal começar com uma avaliação sem custo?"
        },
        {
            title: "Objeção: \"Vou Pensar\"",
            intent: "MAIS_INFORMACOES",
            objectionTag: "decisao",
            program: null,
            templateText: "Super válido! Decisão consciente é importante 💭 Enquanto pensa, posso te enviar 2 depoimentos de pacientes que tinham a mesma dúvida? E nossa agenda está 78% cheia este mês - te seguro um horário?"
        },
        {
            title: "Comparação com Concorrente",
            intent: "MAIS_INFORMACOES",
            objectionTag: "comparacao",
            program: null,
            templateText: "Excelente que está pesquisando! Nossa diferença principal: médico especialista EM MEDICINA DO ESPORTE (não apenas nutricionista), + exames de bioimpedância mensais. Quer ver o comparativo detalhado?"
        },

        // URGÊNCIA/DOR
        {
            title: "Lead Frustrado (\"Já Tentei Tudo\")",
            intent: "AGENDAR_CONSULTA",
            program: null,
            templateText: "Essa frustração é MAIS COMUM do que você imagina. 87% dos nossos pacientes disseram exatamente isso. O problema nunca foi você - foi a abordagem genérica. Medicina integrativa = protocolo 100% individual. Vamos descobrir o QUE trava seu metabolismo?"
        },
        {
            title: "Atleta Buscando Performance",
            intent: "AGENDAR_CONSULTA",
            program: "RESET",
            templateText: "🏆 Perfeito! Trabalhamos com protocolos de VO2max, limiar anaeróbico e suplementação estratégica. Meta típica: ganho de 8-12% em performance em 12 semanas. Você compete ou treina recreativo?"
        },

        // SOCIAL PROOF
        {
            title: "Pedido de Casos de Sucesso",
            intent: "MAIS_INFORMACOES",
            program: null,
            templateText: "Claro! Temos centenas de transformações documentadas. Qual se parece mais com seu caso: (A) Emagrecimento pós-30 anos, (B) Hipertrofia natural, (C) Saúde preventiva/longevidade? Te indico 3 pacientes com perfil similar."
        },
        {
            title: "Dúvida sobre Médico/Especialização",
            intent: "MAIS_INFORMACOES",
            program: null,
            templateText: "Dr. Matheus: Pós-graduação em Medicina Esportiva (USP) + 8 anos em alta performance. Dra. Iris: Nutrologia + Medicina Integrativa. Ambos atendem presencial. Prefere qual abordagem?"
        },

        // REENGAJAMENTO (Automação Futura)
        {
            title: "Follow-up 24h (Sem Resposta)",
            intent: "MAIS_INFORMACOES",
            program: null,
            templateText: "Oi! Vi que você perguntou sobre nossos programas ontem. Ficou alguma dúvida? Ou prefere que eu te envie um vídeo de 2min explicando como funciona na prática?"
        },
        {
            title: "Follow-up 7 Dias (Lead Frio)",
            intent: "AGENDAR_CONSULTA",
            program: null,
            templateText: "Semana corrida, né? 😅 Liberamos 3 vagas EXTRAS para este mês (era só para lista VIP, mas... shh 🤫). Última chance de garantir atendimento ainda em Janeiro. Topa?"
        }
    ];

    for (const pb of playbooks) {
        await prisma.playbook.create({ data: pb });
        console.log(`📋 Criado: ${pb.title}`);
    }

    console.log(`\n✅ ${playbooks.length} Playbooks Premium instalados!`);
    console.log('🎯 Sistema pronto para conversão máxima.');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
