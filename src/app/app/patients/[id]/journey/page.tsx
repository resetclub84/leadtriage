'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, TrendingDown, Flame, Target, Calendar,
    Camera, Trophy, Users, Share2, CheckCircle,
    Scale, Moon, Zap, Heart, MessageSquare, Plus, Settings, Send
} from 'lucide-react';

interface JourneyData {
    patient: any;
    metrics: {
        totalWeightLoss: number;
        currentWeight: number;
        progressPercentage: number;
        avgEnergy: number;
        avgSleep: number;
        avgAdherence: number;
        totalCheckins: number;
        streak: number;
    };
    timeline: any[];
}

export default function PatientJourneyPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<JourneyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [showBaselineModal, setShowBaselineModal] = useState(false);

    useEffect(() => {
        fetchJourney();
    }, [params.id]);

    const fetchJourney = async () => {
        const res = await fetch(`/api/patients/${params.id}/journey`);
        if (res.ok) {
            const journeyData = await res.json();
            setData(journeyData);
        }
        setLoading(false);
    };

    const celebrateMilestone = async (milestoneId: string) => {
        if (!confirm('Enviar mensagem de celebração via WhatsApp?')) return;

        try {
            const res = await fetch(`/api/patients/${params.id}/milestone/${milestoneId}/celebrate`, {
                method: 'POST'
            });
            const result = await res.json();

            if (res.ok) {
                alert('🎉 ' + result.message);
                fetchJourney(); // Recarregar para atualizar status de celebrated
            } else {
                alert('Erro: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao celebrar:', error);
            alert('Erro ao enviar celebração');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-10 w-64"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24"></div>)}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-muted">Paciente não encontrado</p>
            </div>
        );
    }

    const { patient, metrics, timeline } = data;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/app/patients/${params.id}`} className="p-2 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif font-semibold">Jornada de {patient.name.split(' ')[0]}</h1>
                        <p className="text-muted text-sm">ResultOS — Sistema de Prova de Resultados</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCheckinModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Check-in
                    </button>
                    <Link
                        href={`/app/patients/${params.id}/studio`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
                    >
                        <Camera className="w-4 h-4" />
                        Before/After
                    </Link>
                    <button
                        onClick={() => setShowReferralModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    >
                        <Share2 className="w-4 h-4" />
                        Indicar Amigo
                    </button>
                    <button
                        onClick={() => setShowBaselineModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Alerta para configurar baseline */}
            {!patient.initialWeight && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Scale className="w-6 h-6 text-amber-400" />
                        <div>
                            <p className="font-medium text-amber-400">Configure o ponto de partida</p>
                            <p className="text-sm text-muted">Defina o peso inicial e meta para acompanhar o progresso</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBaselineModal(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-sm font-medium"
                    >
                        Configurar Agora
                    </button>
                </div>
            )}

            {/* Métricas Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={TrendingDown}
                    iconColor="text-emerald-400"
                    bgColor="bg-emerald-500/10"
                    value={`${metrics.totalWeightLoss}kg`}
                    label="Peso Perdido"
                    subtitle={`Atual: ${metrics.currentWeight}kg`}
                />
                <MetricCard
                    icon={Target}
                    iconColor="text-indigo-400"
                    bgColor="bg-indigo-500/10"
                    value={`${metrics.progressPercentage}%`}
                    label="Progresso da Meta"
                    subtitle={patient.goalWeight ? `Meta: ${patient.goalWeight}kg` : 'Definir meta'}
                />
                <MetricCard
                    icon={Flame}
                    iconColor="text-orange-400"
                    bgColor="bg-orange-500/10"
                    value={metrics.streak}
                    label="Dias Consecutivos"
                    subtitle="Sequência de check-ins"
                />
                <MetricCard
                    icon={Trophy}
                    iconColor="text-amber-400"
                    bgColor="bg-amber-500/10"
                    value={patient.milestones?.length || 0}
                    label="Conquistas"
                    subtitle="Marcos alcançados"
                />
            </div>

            {/* Métricas de Bem-estar */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Indicadores de Bem-estar
                </h3>
                <div className="grid grid-cols-3 gap-6">
                    <WellnessBar label="Energia" value={metrics.avgEnergy} icon={Zap} color="amber" />
                    <WellnessBar label="Sono" value={metrics.avgSleep} icon={Moon} color="indigo" />
                    <WellnessBar label="Aderência" value={metrics.avgAdherence} icon={CheckCircle} color="emerald" />
                </div>
            </div>

            {/* Conquistas / Milestones */}
            {patient.milestones && patient.milestones.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        Conquistas Desbloqueadas
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {patient.milestones.map((milestone: any) => (
                            <div
                                key={milestone.id}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/20 group"
                            >
                                <span className="text-2xl">{milestone.badgeIcon}</span>
                                <div className="flex-1">
                                    <p className="font-medium text-white text-sm">{milestone.title}</p>
                                    <p className="text-xs text-muted">{new Date(milestone.achievedAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                {!milestone.celebrated && (
                                    <button
                                        onClick={() => celebrateMilestone(milestone.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                        title="Enviar celebração via WhatsApp"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                )}
                                {milestone.celebrated && (
                                    <span className="text-xs text-emerald-400" title="Já celebrado">✓</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Linha do Tempo
                </h3>
                <div className="space-y-4">
                    {timeline.length === 0 ? (
                        <p className="text-center text-muted py-8">
                            Nenhum registro ainda. Faça o primeiro check-in!
                        </p>
                    ) : (
                        timeline.slice(0, 10).map((event: any, index: number) => (
                            <TimelineEvent key={index} event={event} />
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Check-in */}
            {showCheckinModal && (
                <CheckinModal
                    patientId={params.id as string}
                    onClose={() => setShowCheckinModal(false)}
                    onSuccess={() => {
                        setShowCheckinModal(false);
                        fetchJourney();
                    }}
                />
            )}

            {/* Modal de Referral */}
            {showReferralModal && (
                <ReferralModal
                    patientId={params.id as string}
                    onClose={() => setShowReferralModal(false)}
                />
            )}

            {/* Modal de Baseline */}
            {showBaselineModal && (
                <BaselineModal
                    patientId={params.id as string}
                    initialData={{
                        initialWeight: patient.initialWeight || '',
                        goalWeight: patient.goalWeight || ''
                    }}
                    onClose={() => setShowBaselineModal(false)}
                    onSuccess={() => {
                        setShowBaselineModal(false);
                        fetchJourney();
                    }}
                />
            )}
        </div>
    );
}

// Componentes auxiliares

function MetricCard({ icon: Icon, iconColor, bgColor, value, label, subtitle }: any) {
    return (
        <div className="glass-card p-4">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-muted">{label}</p>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}

function WellnessBar({ label, value, icon: Icon, color }: any) {
    const colorMap: any = {
        amber: 'bg-amber-500',
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500'
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                </span>
                <span className="text-sm font-medium text-white">{value}/10</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorMap[color]} rounded-full transition-all duration-500`}
                    style={{ width: `${(value / 10) * 100}%` }}
                />
            </div>
        </div>
    );
}

function TimelineEvent({ event }: { event: any }) {
    const typeConfig: any = {
        CHECKIN: { icon: Scale, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Check-in' },
        PHOTO: { icon: Camera, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Foto' },
        MILESTONE: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Conquista' },
        APPOINTMENT: { icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Consulta' }
    };

    const config = typeConfig[event.type] || typeConfig.CHECKIN;
    const Icon = config.icon;

    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-white">
                        {event.type === 'CHECKIN' && event.data.weight && `${event.data.weight}kg`}
                        {event.type === 'MILESTONE' && event.data.title}
                        {event.type === 'APPOINTMENT' && event.data.type}
                        {event.type === 'PHOTO' && 'Foto registrada'}
                    </span>
                    <span className="text-xs text-muted">
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                    </span>
                </div>
                {event.data.notes && (
                    <p className="text-sm text-muted mt-1 truncate">{event.data.notes}</p>
                )}
            </div>
        </div>
    );
}

function CheckinModal({ patientId, onClose, onSuccess }: { patientId: string; onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        weight: '',
        energyLevel: '7',
        sleepQuality: '7',
        adherenceScore: '7',
        wins: '',
        challenges: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch(`/api/patients/${patientId}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            onSuccess();
        } else {
            alert(data.error);
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-indigo-500/10">
                    <h2 className="text-xl font-semibold text-white">Novo Check-in</h2>
                    <p className="text-sm text-muted mt-1">Registre seu progresso semanal</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Peso atual (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="premium-input w-full"
                            placeholder="Ex: 75.5"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Energia (1-10)</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.energyLevel}
                                onChange={(e) => setFormData({ ...formData, energyLevel: e.target.value })}
                                className="premium-input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Sono (1-10)</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.sleepQuality}
                                onChange={(e) => setFormData({ ...formData, sleepQuality: e.target.value })}
                                className="premium-input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Aderência (1-10)</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.adherenceScore}
                                onChange={(e) => setFormData({ ...formData, adherenceScore: e.target.value })}
                                className="premium-input w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">🎉 Vitórias da semana</label>
                        <textarea
                            value={formData.wins}
                            onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                            className="premium-input w-full h-20"
                            placeholder="O que deu certo? Pequenas ou grandes vitórias..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">💪 Desafios enfrentados</label>
                        <textarea
                            value={formData.challenges}
                            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                            className="premium-input w-full h-20"
                            placeholder="O que foi difícil? Como superou?"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="premium-button">
                            {loading ? 'Salvando...' : 'Registrar Check-in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ReferralModal({ patientId, onClose }: { patientId: string; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [referralData, setReferralData] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        const res = await fetch(`/api/patients/${patientId}/referral`);
        if (res.ok) {
            const data = await res.json();
            setReferralData(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch(`/api/patients/${patientId}/referral`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            setFormData({ name: '', phone: '', email: '' });
            fetchReferralData();
        } else {
            alert(data.error);
        }

        setLoading(false);
    };

    const copyLink = () => {
        if (referralData?.referralLink) {
            navigator.clipboard.writeText(referralData.referralLink);
            alert('Link copiado!');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-indigo-500/10">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        Indicar Amigo
                    </h2>
                    <p className="text-sm text-muted mt-1">Ajude quem você ama a transformar a vida também!</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Link de indicação */}
                    {referralData && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-sm text-emerald-400 mb-2">Seu link de indicação:</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={referralData.referralLink}
                                    readOnly
                                    className="flex-1 bg-black/20 px-3 py-2 rounded-lg text-sm text-white"
                                />
                                <button onClick={copyLink} className="px-3 py-2 bg-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/30">
                                    Copiar
                                </button>
                            </div>
                            <div className="mt-3 flex gap-4 text-xs text-muted">
                                <span>📨 {referralData.stats.totalInvites} indicações</span>
                                <span>✅ {referralData.stats.totalConverted} convertidos</span>
                            </div>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-slate-300">Ou indique diretamente:</p>
                        <div>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="premium-input w-full"
                                placeholder="Nome do amigo(a)"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="premium-input w-full"
                                placeholder="WhatsApp (com DDD)"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="premium-input w-full"
                                placeholder="E-mail (opcional)"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
                                Fechar
                            </button>
                            <button type="submit" disabled={loading} className="premium-button">
                                {loading ? 'Enviando...' : 'Enviar Indicação'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function BaselineModal({
    patientId,
    initialData,
    onClose,
    onSuccess
}: {
    patientId: string;
    initialData: { initialWeight: string | number; goalWeight: string | number };
    onClose: () => void;
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        initialWeight: initialData.initialWeight?.toString() || '',
        goalWeight: initialData.goalWeight?.toString() || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch(`/api/patients/${patientId}/baseline`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initialWeight: parseFloat(formData.initialWeight) || 0,
                goalWeight: parseFloat(formData.goalWeight) || 0
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            onSuccess();
        } else {
            alert(data.error);
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md">
                <div className="p-6 border-b border-indigo-500/10">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Scale className="w-5 h-5 text-indigo-400" />
                        Configurar Baseline
                    </h2>
                    <p className="text-sm text-muted mt-1">Defina o ponto de partida da jornada</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Peso Inicial (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.initialWeight}
                            onChange={(e) => setFormData({ ...formData, initialWeight: e.target.value })}
                            className="premium-input w-full"
                            placeholder="Ex: 95.0"
                            required
                        />
                        <p className="text-xs text-muted mt-1">Peso no início do programa</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Meta de Peso (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.goalWeight}
                            onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                            className="premium-input w-full"
                            placeholder="Ex: 80.0"
                            required
                        />
                        <p className="text-xs text-muted mt-1">Objetivo a alcançar</p>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-sm text-indigo-400">
                            💡 Com esses dados, o sistema calculará automaticamente o progresso e
                            desbloqueará conquistas quando marcos forem atingidos.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="premium-button">
                            {loading ? 'Salvando...' : 'Salvar Configuração'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
