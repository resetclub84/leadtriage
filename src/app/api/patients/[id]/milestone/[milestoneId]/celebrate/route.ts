import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/patients/[id]/milestone/[milestoneId]/celebrate - Enviar celebração via WhatsApp
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id, milestoneId } = await params;

    try {
        // Buscar paciente e milestone
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                milestones: {
                    where: { id: milestoneId }
                }
            }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        const milestone = patient.milestones[0];
        if (!milestone) {
            return NextResponse.json({ error: 'Conquista não encontrada' }, { status: 404 });
        }

        if (milestone.celebrated) {
            return NextResponse.json({ error: 'Conquista já foi celebrada' }, { status: 400 });
        }

        // Gerar mensagem de celebração personalizada
        const message = generateCelebrationMessage(patient.name, milestone);

        // Formatar número de telefone
        const phone = patient.phone?.replace(/\D/g, '') || '';
        if (!phone) {
            return NextResponse.json({ error: 'Paciente não tem telefone cadastrado' }, { status: 400 });
        }

        // Enviar via WhatsApp Cloud API
        const whatsappResult = await sendWhatsAppMessage(phone, message);

        // Marcar como celebrado
        await prisma.patientMilestone.update({
            where: { id: milestoneId },
            data: { celebrated: true }
        });

        return NextResponse.json({
            success: true,
            message: 'Celebração enviada com sucesso!',
            whatsappStatus: whatsappResult.success ? 'sent' : 'failed',
            celebrationMessage: message
        });

    } catch (error) {
        console.error('Erro ao enviar celebração:', error);
        return NextResponse.json({ error: 'Erro ao enviar celebração' }, { status: 500 });
    }
}

// Gerar mensagem de celebração personalizada
function generateCelebrationMessage(patientName: string, milestone: any): string {
    const firstName = patientName.split(' ')[0];

    const messages: Record<string, string> = {
        'WEIGHT_3KG': `🎉 *PARABÉNS, ${firstName}!* 🎉\n\n` +
            `Você acabou de conquistar seus primeiros *3kg perdidos*! 🌟\n\n` +
            `Isso é só o começo da sua transformação. Continue assim!\n\n` +
            `_Equipe Gurgel Carrilho_`,

        'WEIGHT_5KG': `🔥 *INCRÍVEL, ${firstName}!* 🔥\n\n` +
            `Você atingiu a marca de *5kg perdidos*! Isso representa uma mudança real no seu corpo e na sua saúde.\n\n` +
            `Você está no caminho certo. Estamos orgulhosos de você! 💪\n\n` +
            `_Equipe Gurgel Carrilho_`,

        'WEIGHT_10KG': `💪 *TRANSFORMAÇÃO ÉPICA, ${firstName}!* 💪\n\n` +
            `Você chegou aos *10kg perdidos*! Isso é uma conquista extraordinária que poucos conseguem.\n\n` +
            `Seu corpo está diferente. Sua saúde está diferente. VOCÊ está diferente. 🏆\n\n` +
            `Continue inspirando! _Equipe Gurgel Carrilho_`,

        'WEIGHT_15KG': `🏆 *VOCÊ É UMA INSPIRAÇÃO, ${firstName}!* 🏆\n\n` +
            `*15kg perdidos*! Você está literalmente transformando sua vida.\n\n` +
            `Que tal compartilhar sua história para inspirar outros? Fale com a gente!\n\n` +
            `_Equipe Gurgel Carrilho_`,

        'WEIGHT_20KG': `⭐ *LENDA VIVA, ${firstName}!* ⭐\n\n` +
            `*20kg perdidos*! Você conquistou algo que muitos acham impossível.\n\n` +
            `Sua história merece ser contada. Vamos marcar um depoimento? 📹\n\n` +
            `_Equipe Gurgel Carrilho_`,

        'STREAK_7': `🔥 *7 DIAS SEGUIDOS, ${firstName}!* 🔥\n\n` +
            `Uma semana de consistência! Isso mostra que você está comprometido(a).\n\n` +
            `Continue checando e registrando seu progresso!\n\n` +
            `_Equipe Gurgel Carrilho_`,

        'STREAK_30': `🌟 *30 DIAS DE DEDICAÇÃO, ${firstName}!* 🌟\n\n` +
            `Um mês inteiro de check-ins! Você está criando um hábito de vida.\n\n` +
            `Isso é o que separa quem transforma de quem só tenta. 💪\n\n` +
            `_Equipe Gurgel Carrilho_`
    };

    return messages[milestone.type] ||
        `🎉 *Parabéns, ${firstName}!* 🎉\n\n` +
        `Você conquistou: *${milestone.title}*! ${milestone.badgeIcon}\n\n` +
        `Continue assim, você está arrasando!\n\n` +
        `_Equipe Gurgel Carrilho_`;
}

// Enviar mensagem via WhatsApp Cloud API
async function sendWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
        console.warn('WhatsApp API não configurada');
        return { success: false, error: 'WhatsApp API não configurada' };
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: phone.startsWith('55') ? phone : `55${phone}`,
                    type: 'text',
                    text: { body: message }
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            return { success: true };
        } else {
            console.error('Erro WhatsApp API:', data);
            return { success: false, error: data.error?.message || 'Erro desconhecido' };
        }
    } catch (error: any) {
        console.error('Erro ao enviar WhatsApp:', error);
        return { success: false, error: error.message };
    }
}
