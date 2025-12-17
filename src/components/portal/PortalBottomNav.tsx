'use client';

import { Home, Activity, Award, User, MoreHorizontal, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalBottomNav({ code }: { code: string }) {
    const pathname = usePathname();

    const tabs = [
        { icon: <Home className="w-6 h-6" />, label: 'Início', path: `/app/portal/${code}/dashboard` },
        { icon: <Dumbbell className="w-6 h-6" />, label: 'Meu Plano', path: `/app/portal/${code}/program` },
        { icon: <Activity className="w-6 h-6" />, label: 'Jornada', path: `/app/portal/${code}/journey` },
        { icon: <User className="w-6 h-6" />, label: 'Comunidade', path: `/app/portal/${code}/community` },
        { icon: <MoreHorizontal className="w-6 h-6" />, label: 'Perfil', path: `/app/portal/${code}/profile` },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-900 pb-safe max-w-md mx-auto">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                        <Link
                            key={tab.path}
                            href={tab.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {tab.icon}
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
