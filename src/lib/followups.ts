
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Schedule follow-up messages for a lead (24h, 7d, 30d)
 */
export async function scheduleFollowUps(leadId: string) {
    const now = new Date();

    // 24-hour follow-up
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await prisma.scheduledMessage.create({
        data: {
            leadId,
            scheduledFor: in24h,
            message: "Oi! Vi que você perguntou sobre nossos programas ontem. Ficou alguma dúvida? Ou prefere que eu te envie um vídeo de 2min explicando como funciona na prática?"
        }
    });

    // 7-day follow-up
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await prisma.scheduledMessage.create({
        data: {
            leadId,
            scheduledFor: in7d,
            message: "Semana corrida, né? 😅 Liberamos 3 vagas EXTRAS para este mês (era só para lista VIP, mas... shh 🤫). Última chance de garantir atendimento ainda em Janeiro. Topa?"
        }
    });

    // 30-day follow-up (re-engagement)
    const in30d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await prisma.scheduledMessage.create({
        data: {
            leadId,
            scheduledFor: in30d,
            message: "Olá! Faz 1 mês que conversamos. Mudou algo na sua rotina que te faz considerar iniciar agora? Temos uma condição especial para quem volta. 💪"
        }
    });

    console.log(`📅 Scheduled 3 follow-ups for lead ${leadId}`);
}

/**
 * Cancel all pending follow-ups for a lead (when they convert or respond)
 */
export async function cancelFollowUps(leadId: string, reason: string = 'lead_responded') {
    await prisma.scheduledMessage.updateMany({
        where: {
            leadId,
            sent: false,
            cancelled: false
        },
        data: {
            cancelled: true,
            cancelledReason: reason
        }
    });

    console.log(`🚫 Cancelled follow-ups for lead ${leadId} - Reason: ${reason}`);
}
