
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// GET /api/community/feed
export async function GET() {
    try {
        const milestones = await prisma.patientMilestone.findMany({
            take: 50,
            orderBy: { achievedAt: 'desc' },
            include: {
                patient: {
                    select: {
                        name: true,
                        city: true,
                        state: true
                    }
                }
            }
        });

        // Format and anonymize
        const feed = milestones.map(m => {
            // Anonimizar nome: "Maria Silva" -> "Maria S."
            const names = m.patient.name.split(' ');
            const publicName = names.length > 1
                ? `${names[0]} ${names[1][0]}.`
                : names[0];

            return {
                id: m.id,
                title: m.title,
                description: m.description,
                type: m.type,
                badgeIcon: m.badgeIcon,
                user: {
                    name: publicName, // Semi-anônimo
                    location: m.patient.city ? `${m.patient.city}/${m.patient.state}` : 'Brasil'
                },
                timeAgo: formatDistanceToNow(new Date(m.achievedAt), { addSuffix: true, locale: ptBR }),
                rawDate: m.achievedAt
            };
        });

        return NextResponse.json(feed);
    } catch (error) {
        console.error('Feed error:', error);
        return NextResponse.json({ error: 'Erro ao carregar feed' }, { status: 500 });
    }
}
