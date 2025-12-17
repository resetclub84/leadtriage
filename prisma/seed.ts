import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@leadtriage.com' },
        update: {},
        create: {
            email: 'admin@leadtriage.com',
            name: 'Dr. Admin',
            password: 'admin', // In production, hash this!
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

    console.log(`Created users: ${admin.name}, ${staff.name}`)

    // 2. Create Playbooks
    const p1 = await prisma.playbook.create({
        data: {
            title: "Agendamento Padrão",
            intent: "AGENDAR_CONSULTA",
            program: "RESET",
            templateText: "Olá! Vi que tem interesse no RESET. Nossa agenda para Dr. Matheus está aberta para próxima semana. Gostaria de verificar disponibilidade na Terça ou Quinta?"
        }
    })

    const p2 = await prisma.playbook.create({
        data: {
            title: "Objeção de Preço",
            intent: "MAIS_INFORMACOES",
            objectionTag: "preco",
            program: "Generic",
            templateText: "Entendo a questão do investimento. O RESET não é apenas uma dieta, é um acompanhamento médico completo de 5 meses. Se parcelarmos, ficaria confortável para você?"
        }
    })

    console.log('Created playbooks')

    // 3. Create Leads
    const lead1 = await prisma.lead.create({
        data: {
            source: 'whatsapp',
            name: 'Maria Silva',
            phone: '11999998888',
            message: 'Gostaria de saber mais sobre o programa de emagrecimento.',
            status: 'TRIAGING',
            tags: 'interessado,emagrecimento',
            assignedTo: { connect: { id: staff.id } },
            triage: {
                create: {
                    resposta_ao_usuario: 'Olá Maria! O programa de emagrecimento foca em reeducação alimentar e acompanhamento médico.',
                    intent: 'MAIS_INFORMACOES',
                    lead_score: 'medio',
                    interesse_principal: 'emagrecimento',
                    nivel_urgencia: 'moderada',
                    provavel_plano: '5_meses',
                    indicacao_programa: 'RESET',
                    precisa_humano: true,
                    raw_json: JSON.stringify({})
                }
            }
        },
    })

    const lead2 = await prisma.lead.create({
        data: {
            source: 'instagram',
            name: 'João Souza',
            phone: '11977776666',
            message: 'Quero agendar uma consulta pro RESET.',
            status: 'NEW',
            tags: 'novo,site',
            assignedTo: { connect: { id: admin.id } },
            triage: {
                create: {
                    resposta_ao_usuario: 'Claro João, vamos agendar. Qual sua disponibilidade?',
                    intent: 'AGENDAR_CONSULTA',
                    lead_score: 'alto',
                    interesse_principal: 'consulta_medica',
                    nivel_urgencia: 'alta',
                    provavel_plano: '7_meses',
                    indicacao_programa: 'RESET',
                    precisa_humano: true,
                    raw_json: JSON.stringify({})
                }
            }
        },
    })

    // Create Timeline Events
    await prisma.eventLog.create({
        data: {
            leadId: lead1.id,
            type: 'CREATED',
            payload: JSON.stringify({ source: 'whatsapp' })
        }
    })

    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
