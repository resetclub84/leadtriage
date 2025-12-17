'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Settings, LogOut, Menu, Inbox, BookOpen, BarChart3, FileText, Brain, Sparkles, Users, Wand2, Share2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Painel', href: '/app/dashboard', icon: LayoutDashboard },
        { name: 'Caixa de Entrada', href: '/app/leads', icon: Inbox },
        { name: 'Pacientes', href: '/app/patients', icon: Users },
        { name: 'Protocolos IA', href: '/app/protocols', icon: Wand2 },
        { name: 'Indicações', href: '/app/referrals', icon: Share2 },
        { name: 'ResultOS', href: '/app/portfolio', icon: TrendingUp },
        { name: 'Playbooks', href: '/app/playbooks', icon: BookOpen },
        { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
        { name: 'Cérebro IA', href: '/app/settings/brain', icon: Brain },
        { name: 'Configurações', href: '/app/settings', icon: Settings },
    ];

    const getTitle = () => {
        if (pathname.includes('/leads') && pathname.split('/').length > 3) return 'Detalhes do Lead';
        if (pathname.includes('/leads')) return 'Caixa de Entrada';
        if (pathname.includes('/patients') && pathname.split('/').length > 3) return 'Detalhes do Paciente';
        if (pathname.includes('/patients')) return 'Pacientes';
        if (pathname.includes('/protocols')) return 'Protocolos IA';
        if (pathname.includes('/settings/brain')) return 'Cérebro IA';
        if (pathname.includes('/settings')) return 'Configurações';
        if (pathname.includes('/playbooks')) return 'Playbooks';
        if (pathname.includes('/analytics')) return 'Analytics';
        return 'Central de Comando';
    };

    return (
        <div className="flex h-screen bg-background text-text font-sans">
            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity",
                    isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar Premium */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 lg:translate-x-0 lg:static",
                "sidebar-premium",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center px-6 border-b border-indigo-500/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center mr-3">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-serif font-bold gradient-text">LeadTriage</span>
                </div>

                <div className="flex flex-col justify-between h-[calc(100vh-64px)] p-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                                        isActive
                                            ? 'sidebar-item-active bg-gradient-to-r from-indigo-500/20 to-transparent text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-slate-500")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t border-indigo-500/10">
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300"
                        >
                            <LogOut className="h-5 w-5" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 border-b border-border bg-surface px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-text" />
                        </Button>
                        <h1 className="text-lg font-serif font-semibold text-primary">{getTitle()}</h1>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
