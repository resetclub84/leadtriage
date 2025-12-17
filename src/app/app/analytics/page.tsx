'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

interface Stats {
    totalLeads: number;
    newLeads: number;
    qualified: number;
    scheduled: number;
    paid: number;
    conversionRate: number;
    avgResponseTime: number;
    totalRevenue: number;
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics/funnel')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8">Carregando métricas...</div>;

    const conversionPercent = stats ? Math.round(stats.conversionRate * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Analytics & Conversão</h2>
                <p className="text-gray-400">Funil de vendas em tempo real</p>
            </div>

            {/* KPIs Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total de Leads</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.totalLeads || 0}</div>
                        <p className="text-xs text-green-400">+{stats?.newLeads || 0} últimos 7 dias</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Taxa de Conversão</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{conversionPercent}%</div>
                        <p className="text-xs text-gray-400">Lead → Agendamento</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Tempo de Resposta</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.avgResponseTime || 0}s</div>
                        <p className="text-xs text-gray-400">Média (Auto-resposta)</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">R$ {stats?.totalRevenue.toLocaleString('pt-BR') || 0}</div>
                        <p className="text-xs text-gray-400">Pré-agendamentos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Funnel */}
            <Card className="border-border bg-card/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-secondary" />
                        Funil de Conversão
                    </CardTitle>
                    <CardDescription>Pipeline de vendas automatizado</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Stage: New Leads */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">1. Leads Novos</span>
                                <span className="text-sm text-gray-400">{stats?.totalLeads || 0}</span>
                            </div>
                            <div className="w-full h-8 bg-gray-700 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                                    style={{ width: '100%' }}
                                >
                                    100%
                                </div>
                            </div>
                        </div>

                        {/* Stage: Qualified */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">2. Qualificados (Alto Score)</span>
                                <span className="text-sm text-gray-400">{stats?.qualified || 0}</span>
                            </div>
                            <div className="w-full h-8 bg-gray-700 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold"
                                    style={{ width: `${stats?.totalLeads ? (stats.qualified / stats.totalLeads * 100) : 0}%` }}
                                >
                                    {stats?.totalLeads ? Math.round(stats.qualified / stats.totalLeads * 100) : 0}%
                                </div>
                            </div>
                        </div>

                        {/* Stage: Scheduled */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">3. Agendamentos</span>
                                <span className="text-sm text-gray-400">{stats?.scheduled || 0}</span>
                            </div>
                            <div className="w-full h-8 bg-gray-700 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-yellow-500 flex items-center justify-center text-white text-sm font-semibold"
                                    style={{ width: `${stats?.totalLeads ? (stats.scheduled / stats.totalLeads * 100) : 0}%` }}
                                >
                                    {stats?.totalLeads ? Math.round(stats.scheduled / stats.totalLeads * 100) : 0}%
                                </div>
                            </div>
                        </div>

                        {/* Stage: Paid */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">4. Pagamentos Confirmados</span>
                                <span className="text-sm text-gray-400">{stats?.paid || 0}</span>
                            </div>
                            <div className="w-full h-8 bg-gray-700 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
                                    style={{ width: `${stats?.totalLeads ? (stats.paid / stats.totalLeads * 100) : 0}%` }}
                                >
                                    {stats?.totalLeads ? Math.round(stats.paid / stats.totalLeads * 100) : 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
