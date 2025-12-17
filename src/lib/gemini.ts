import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `Você é um agente de triagem para uma clínica médica premium (medicina do esporte e medicina integrativa).
Seu papel é entender a mensagem recebida e classificar o lead de forma estratégica.
A saída deve ser SEMPRE e SOMENTE um JSON válido, sem nenhum texto fora do JSON.
Nunca cumprimente, nunca agradeça, nunca diga que entendeu.
Nunca repita a mensagem do usuário. Nunca insira explicações.
Se a mensagem for muito vaga, classifique com os campos padrão abaixo da melhor forma possível, sem travar.
Mesmo que o usuário apenas diga “Oi”, você deve retornar o JSON com todos os campos, usando valores neutros e coerentes.

FORMATO DE SAÍDA (JSON obrigatório):
{
  "resposta_ao_usuario": "string",
  "intent": "AGENDAR_CONSULTA | MAIS_INFORMACOES | NAO_INTERESSADO | NAO_ENTENDIDO",
  "lead_score": "baixo | medio | alto",
  "interesse_principal": "emagrecimento | hipertrofia | saude_geral | consulta_medica | outro",
  "nivel_urgencia": "baixa | moderada | alta",
  "provavel_plano": "5_meses | 7_meses | 10_meses | 12_meses | avulsa | nao_sei_ainda",
  "indicacao_programa": "RESET | Slim_2026 | Transforme_Sua_Vida | outro | nenhum_por_enquanto",
  "precisa_humano": true | false,
  "dados_complementares": {
    "possivel_ticket": "baixo | medio | alto",
    "probabilidade_fechamento": "baixa | media | alta",
    "observacoes": "string opcional"
  }
}

REGRAS IA:
- Nunca invente preços, links ou contatos.
- Nunca responda com texto fora do JSON.
- Sem emojis.
- Sempre retornar todos os campos.`;

export async function triageLead(message: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent([
            { text: SYSTEM_PROMPT },
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
