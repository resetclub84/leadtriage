'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Settings, LogOut, Menu, Inbox, BookOpen, BarChart3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { name: 'Inbox', href: '/app/leads', icon: Inbox },
        { name: 'Playbooks', href: '/app/playbooks', icon: BookOpen },
        { name: 'Reports', href: '/app/reports', icon: BarChart3 },
        { name: 'Settings', href: '/app/settings', icon: Settings },
    ];

    const getTitle = () => {
        if (pathname.includes('/leads') && pathname.split('/').length > 3) return 'Lead Details';
        if (pathname.includes('/leads')) return 'Inbox';
        if (pathname.includes('/settings')) return 'Settings';
        if (pathname.includes('/playbooks')) return 'Playbooks';
        if (pathname.includes('/reports')) return 'Reports';
        return 'Control Tower';
    };

    return (
        <div className="flex h-screen bg-background text-text font-sans">
            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 lg:hidden",
                    isMobileMenuOpen ? "block" : "hidden"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform bg-surface border-r border-border transition-transform duration-200 lg:translate-x-0 lg:static",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center px-6 border-b border-border">
                    <FileText className="h-6 w-6 text-primary mr-2" />
                    <span className="text-xl font-serif font-bold text-primary tracking-tight">LeadTriage</span>
                </div>

                <div className="flex flex-col justify-between h-[calc(100vh-64px)] p-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            // Active if exact match or if it's a subroute (e.g. lead details)
                            const isActive = pathname === item.href || (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border-l-2',
                                        isActive
                                            ? 'bg-[rgba(59,130,246,0.10)] text-text border-primary'
                                            : 'border-transparent text-muted hover:bg-[rgba(255,255,255,0.04)] hover:text-text'
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t border-border">
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-red-50 hover:text-danger transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
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
