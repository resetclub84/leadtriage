
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Lazy initialization to prevent build-time errors
let _model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
    if (!_model) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY não configurada');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        _model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    return _model;
}

export async function POST(req: Request) {
    try {
        const { message, accessCode, history = [] } = await req.json();

        if (!message || !accessCode) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        // 1. Authenticate & Fetch Context
        const patient = await prisma.patient.findUnique({
            where: { accessCode },
            select: {
                name: true,
                gender: true,
                programStartDate: true,
                nutritionGoals: true,
                trainingGoals: true,
                protocol: true, // The Holy Grail context
            }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // 2. Build System Prompt with Context
        const systemPrompt = `
            Você é o AI Health Coach do aplicativo RESET. Seu nome é "Coach Reset".
            Você está falando com ${patient.name}.
            
            CONTEXTO DO PACIENTE:
            - Gênero: ${patient.gender || 'Não informado'}
            - Objetivo Nutricional: ${patient.nutritionGoals || 'Geral'}
            - Objetivo Treino: ${patient.trainingGoals || 'Geral'}
            - Início do Programa: ${patient.programStartDate || 'Recente'}
            
            PROTOCOLO MÉDICO DO PACIENTE (Siga isso estritamente):
            ---
            ${patient.protocol || 'Nenhum protocolo definido ainda.'}
            ---

            DIRETRIZES:
            1. Seja motivador, direto e empático (estilo "coach fit").
            2. Use emojis ocasionalmente.
            3. Responda DÚVIDAS sobre o protocolo baseando-se no texto acima.
            4. Se o usuário perguntar algo fora do protocolo (ex: remédios), diga para consultar o médico humano.
            5. Mantenha respostas curtas (máximo 3 parágrafos).
        `;

        // 3. Construct Chat History for Gemini (Last 5 messages max to save tokens)
        // Note: 'history' comes from client as { role: 'user' | 'model', parts: string }[]
        const chat = getModel().startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt + "\n\nEntendido. Aguardando pergunta." }]
                },
                {
                    role: 'model',
                    parts: [{ text: `Olá ${patient.name}! Sou seu Coach. Como posso ajudar com seu plano hoje? 💪` }]
                },
                ...history.slice(-10) // Keep limited context
            ]
        });

        // 4. Send Message
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({ reply: responseText });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json({ error: 'O Coach está dormindo um pouco. Tente já já.' }, { status: 500 });
    }
}
