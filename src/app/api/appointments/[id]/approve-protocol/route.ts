import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

// POST /api/appointments/[id]/approve-protocol - Aprovar e enviar protocolo
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const { sendToPatient = true, editedProtocol } = body;

        // Buscar consulta com paciente
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { patient: true }
        });

        if (!appointment) {
            return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
        }

        const protocolToSend = editedProtocol || appointment.protocol;

        if (!protocolToSend) {
            return NextResponse.json({ error: 'Nenhum protocolo para aprovar' }, { status: 400 });
        }

        // Atualizar status da consulta
        await prisma.appointment.update({
            where: { id },
            data: {
                protocol: protocolToSend,
                status: 'REALIZADO'
            }
        });

        // Enviar via WhatsApp se solicitado
        let whatsappSent = false;
        if (sendToPatient && appointment.patient.phone) {
            try {
                // Formatar mensagem para WhatsApp
                const message = formatProtocolForWhatsApp(appointment.patient.name, protocolToSend);

                await sendWhatsAppMessage(appointment.patient.phone, message);
                whatsappSent = true;

                // Registrar evento
                await prisma.eventLog.create({
                    data: {
                        type: 'PROTOCOL_SENT',
                        payload: JSON.stringify({
                            appointmentId: id,
                            patientId: appointment.patientId,
                            via: 'whatsapp'
                        })
                    }
                });
            } catch (whatsappError) {
                console.error('Erro ao enviar WhatsApp:', whatsappError);
                // Não falhar a requisição se WhatsApp falhar
            }
        }

        return NextResponse.json({
            success: true,
            whatsappSent,
            message: whatsappSent
                ? 'Protocolo aprovado e enviado ao paciente!'
                : 'Protocolo aprovado. WhatsApp não enviado.'
        });

    } catch (error) {
        console.error('Erro ao aprovar protocolo:', error);
        return NextResponse.json({ error: 'Erro ao aprovar protocolo' }, { status: 500 });
    }
}

function formatProtocolForWhatsApp(patientName: string, protocol: string): string {
    // Limpar markdown para WhatsApp (converter ** para *)
    const cleanProtocol = protocol
        .replace(/\*\*/g, '*')
        .replace(/#{1,3}\s/g, '');

    return `
Olá ${patientName.split(' ')[0]}! 👋

Segue o protocolo personalizado da sua consulta:

${cleanProtocol}

---
_Este protocolo foi gerado e aprovado pela nossa equipe médica._
_Dúvidas? Responda esta mensagem._

Clínica RESET - Programa de Emagrecimento Saudável 💚
`.trim();
}
