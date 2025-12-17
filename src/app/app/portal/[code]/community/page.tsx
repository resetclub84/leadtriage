import { prisma } from '@/lib/prisma';
import FeedCard from '@/components/portal/FeedCard';
import PortalBottomNav from '@/components/portal/PortalBottomNav';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

async function getFeed() {
    const milestones = await prisma.patientMilestone.findMany({
        take: 50,
        orderBy: { achievedAt: 'desc' },
        include: {
            patient: { select: { name: true, city: true, state: true } }
        }
    });

    return milestones.map(m => {
        const names = m.patient.name.split(' ');
        const publicName = names.length > 1 ? `${names[0]} ${names[1][0]}.` : names[0];
        return {
            id: m.id,
            title: m.title,
            description: m.description,
            badgeIcon: m.badgeIcon,
            type: m.type,
            user: { name: publicName, location: m.patient.city ? `${m.patient.city}` : 'Brasil' },
            timeAgo: formatDistanceToNow(new Date(m.achievedAt), { addSuffix: true, locale: ptBR })
        };
    });
}

export default async function CommunityPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const feed = await getFeed();

    return (
        <div className="pb-24 pt-12 px-4 max-w-md mx-auto min-h-screen bg-black">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Comunidade 🌍</h1>
                <p className="text-sm text-zinc-400">Celebre as conquistas da tribo RESET.</p>
            </div>

            <div className="space-y-4">
                {feed.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        Ainda não há conquistas. Seja o primeiro!
                    </div>
                ) : (
                    feed.map(item => <FeedCard key={item.id} item={item} />)
                )}
            </div>

            <PortalBottomNav code={code} />
        </div>
    );
}
