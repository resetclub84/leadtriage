import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST /api/appointments/[id]/generate-protocol - Gerar protocolo IA
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        // Buscar consulta com dados do paciente
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    include: {
                        lead: {
                            include: { triage: true }
                        }
                    }
                }
            }
        });

        if (!appointment) {
            return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
        }

        // Buscar configuração da clínica para contexto
        const config = await prisma.clinicConfig.findFirst();

        // Montar prompt para geração do protocolo
        const prompt = buildProtocolPrompt(appointment, config);

        // Chamar Gemini para gerar protocolo
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const protocol = result.response.text();

        // Salvar protocolo na consulta (ainda não aprovado)
        await prisma.appointment.update({
            where: { id },
            data: {
                protocol,
                status: 'AGUARDANDO_APROVACAO'
            }
        });

        return NextResponse.json({
            success: true,
            protocol,
            message: 'Protocolo gerado. Aguardando aprovação médica.'
        });

    } catch (error) {
        console.error('Erro ao gerar protocolo:', error);
        return NextResponse.json({ error: 'Erro ao gerar protocolo' }, { status: 500 });
    }
}

function buildProtocolPrompt(appointment: any, config: any) {
    const patient = appointment.patient;
    const triage = patient?.lead?.triage;

    return `
Você é um assistente médico especializado em medicina integrativa e emagrecimento saudável.
Gere um PROTOCOLO PÓS-CONSULTA profissional e personalizado para o paciente.

## DADOS DO PACIENTE
- Nome: ${patient.name}
- Data de Nascimento: ${patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'Não informada'}
${triage ? `
## TRIAGEM INICIAL
- Interesse Principal: ${triage.interesse_principal}
- Programa Indicado: ${triage.indicacao_programa}
- Nível de Urgência: ${triage.nivel_urgencia}
- Observações: ${triage.observacoes || 'Nenhuma'}
` : ''}

## DADOS DA CONSULTA
- Data: ${new Date(appointment.date).toLocaleDateString('pt-BR')}
- Tipo: ${appointment.type}
- Notas do Médico: ${appointment.notes || 'Nenhuma nota registrada'}

## INSTRUÇÕES
Gere um protocolo formatado com as seguintes seções:

1. **Resumo da Consulta** (breve parágrafo)
2. **Recomendações Nutricionais** (lista com 3-5 itens)
3. **Orientações de Estilo de Vida** (lista com 2-4 itens)
4. **Próximos Passos** (agendamento, exames, etc)
5. **Mensagem de Encorajamento** (1 frase motivacional personalizada)

O protocolo deve ser:
- Profissional mas acolhedor
- Escrito em português brasileiro
- Claro e fácil de entender pelo paciente
- Ter no máximo 500 palavras

${config?.knowledgeBase ? `\n## CONTEXTO DA CLÍNICA\n${config.knowledgeBase}` : ''}
`;
}
