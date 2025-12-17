import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from '@/lib/prisma';

// Lazy initialization to prevent build-time errors
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY não configurada');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

const SCHEDULE_LINK = "https://cal.com/leadtriage-demo"; // Exemplo

export async function triageLead(message: string) {
    try {
        // Fetch Dynamic Config
        const config = await prisma.clinicConfig.findFirst();

        // Fallback if DB is empty
        const systemPromptToUse = config ? `
${config.systemPrompt}

BASE DE CONHECIMENTO ATUALIZADA:
${config.knowledgeBase}

TAREFA: Analise a mensagem e gere JSON. (Mesmo formato anterior)
` : `Você é um assistente genérico.`;

        const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent([
            { text: systemPromptToUse + "\nFORMATO JSON OBRIGATÓRIO: { \"resposta_ao_usuario\": \"Texto da resposta (max 300 chars). Termine com pergunta.\", \"intent\": \"AGENDAR_CONSULTA | MAIS_INFORMACOES | NAO_INTERESSADO | NAO_ENTENDIDO\", \"lead_score\": \"baixo | medio | alto\", \"interesse_principal\": \"emagrecimento | hipertrofia | saude_geral | consulta_medica | outro\", \"nivel_urgencia\": \"baixa | moderada | alta\", \"provavel_plano\": \"5_meses | 7_meses | 10_meses | 12_meses | avulsa | nao_sei_ainda\", \"indicacao_programa\": \"RESET | Slim_2026 | Transforme_Sua_Vida | outro | nenhum_por_enquanto\", \"precisa_humano\": true | false, \"dados_complementares\": { \"possivel_ticket\": \"baixo | medio | alto\", \"probabilidade_fechamento\": \"baixa | media | alta\", \"observacoes\": \"Resumo da análise\" } }" },
            { text: `MENSAGEM DO LEAD: "${message}"` }
        ]);
        const response = await result.response;
        const text = response.text();

        // Clean code blocks if present
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Gemini Error:", error);
        // Fallback for safety
        return {
            resposta_ao_usuario: "Olá, recebemos sua mensagem. Nossa equipe entrará em contato em breve.",
            intent: "MAIS_INFORMACOES",
            lead_score: "baixo",
            interesse_principal: "outro",
            nivel_urgencia: "baixa",
            provavel_plano: "nao_sei_ainda",
            indicacao_programa: "nenhum_por_enquanto",
            precisa_humano: true,
            dados_complementares: {
                possivel_ticket: "baixo",
                probabilidade_fechamento: "baixa",
                observacoes: "Erro ao processar IA"
            }
        };
    }
}

interface PatientData {
    name: string;
    age: number;
    gender: string;
    weight: number;
    height: number;
    fitnessLevel: string;
    trainingGoals: string[];
    nutritionGoals: string;
}

export async function generateProtocol(patient: PatientData) {
    try {
        // Using gemini-flash-latest: verified available via API list for this key
        const model = getGenAI().getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
ATUE COMO UM MÉDICO DO ESPORTE E NUTRÓLOGO DE ELITE (Estilo ResultOS/STNDRD).

DADOS DO PACIENTE:
- Nome: ${patient.name}
- Idade: ${patient.age} anos
- Gênero: ${patient.gender}
- Peso: ${patient.weight}kg
- Altura: ${patient.height}cm
- Nível de Fitness: ${patient.fitnessLevel}
- Objetivos de Treino: ${patient.trainingGoals.join(", ")}
- Objetivo Nutricional: ${patient.nutritionGoals}

TAREFA:
Crie um protocolo completo e personalizado para este paciente atingir seus objetivos.
O tom deve ser profissional, motivador e direto (Estilo "High Performance").

ESTRUTURA OBRIGATÓRIA (Markdown):
# Protocolo Personalizado - ${patient.name}

## 1. Estratégia Nutricional 🍎
[Descreva a estratégia: Déficit/Superávit/Manutenção]
- **Calorias Alvo:** [Estimativa]
- **Macros Sugeridos:** [Proteína/Carb/Gordura]
- **Dicas:** [2-3 dicas práticas]

## 2. Sugestão de Suplementação 💊
[Liste suplementos essenciais com dosagem básica segura]
- [Suplemento 1]: [Motivo]
- [Suplemento 2]: [Motivo]

## 3. Diretrizes de Treino 🏋️
[Frequência ideal e foco do treino]
- **Foco:** [Força/Hipertrofia/Resistência]
- **Divisão Sugerida:** [ex: ABC, Upper/Lower]
- **Cardio:** [Frequência e intensidade]

## 4. Lifestyle & Recuperação 💤
- **Sono:** [Meta]
- **Hidratação:** [Meta em Litros]

---
*Este protocolo é uma sugestão baseada em IA e deve ser revisado pelo profissional responsável.*
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Protocol Error:", error);
        return `Erro ao gerar protocolo. Por favor, tente novamente ou escreva manualmente.\n\nDetalhes do erro: ${String(error)}`;
    }
}
