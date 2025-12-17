'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, FileText, Send, Check, X, Sparkles, User, AlertCircle } from 'lucide-react';

interface Appointment {
    id: string;
    date: string;
    type: string;
    status: string;
    notes?: string;
    protocol?: string;
    patient: {
        id: string;
        name: string;
        phone: string;
    };
}

export default function ProtocolsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [editedProtocol, setEditedProtocol] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        const res = await fetch('/api/appointments');
        const data = await res.json();
        setAppointments(data);
        setLoading(false);
    };

    const generateProtocol = async (appointmentId: string) => {
        setGeneratingId(appointmentId);

        const res = await fetch(`/api/appointments/${appointmentId}/generate-protocol`, {
            method: 'POST'
        });

        const data = await res.json();

        if (res.ok) {
            await fetchAppointments();
            const apt = appointments.find(a => a.id === appointmentId);
            if (apt) {
                setSelectedAppointment({ ...apt, protocol: data.protocol, status: 'AGUARDANDO_APROVACAO' });
                setEditedProtocol(data.protocol);
            }
        } else {
            alert(data.error);
        }

        setGeneratingId(null);
    };

    const approveProtocol = async (appointmentId: string, sendWhatsApp: boolean) => {
        setApprovingId(appointmentId);

        const res = await fetch(`/api/appointments/${appointmentId}/approve-protocol`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sendToPatient: sendWhatsApp,
                editedProtocol: editedProtocol
            })
        });

        const data = await res.json();

        if (res.ok) {
            await fetchAppointments();
            setSelectedAppointment(null);
            alert(data.message);
        } else {
            alert(data.error);
        }

        setApprovingId(null);
    };

    if (loading) return (
        <div className="p-8 animate-fade-in">
            <div className="skeleton h-10 w-64 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-24"></div>)}
            </div>
        </div>
    );

    const pendingApproval = appointments.filter(a => a.status === 'AGUARDANDO_APROVACAO');
    const needsProtocol = appointments.filter(a => a.status === 'REALIZADO' && !a.protocol);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-serif font-semibold">Protocolos IA</h1>
                <p className="text-muted text-sm mt-1">Gere e aprove protocolos pós-consulta com inteligência artificial</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{pendingApproval.length}</p>
                        <p className="text-sm text-muted">Aguardando Aprovação</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{needsProtocol.length}</p>
                        <p className="text-sm text-muted">Sem Protocolo</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{appointments.filter(a => a.protocol && a.status === 'REALIZADO').length}</p>
                        <p className="text-sm text-muted">Concluídos</p>
                    </div>
                </div>
            </div>

            {/* Lista de Consultas */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Consultas Recentes
                </h3>

                {appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma consulta registrada</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointments.map(apt => (
                            <div
                                key={apt.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {apt.patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{apt.patient.name}</p>
                                        <p className="text-sm text-muted flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(apt.date).toLocaleDateString('pt-BR')} - {apt.type}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'AGUARDANDO_APROVACAO'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : apt.protocol
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-slate-500/10 text-slate-400'
                                        }`}>
                                        {apt.status === 'AGUARDANDO_APROVACAO' ? 'Pendente' : apt.protocol ? 'Concluído' : apt.status}
                                    </span>

                                    {!apt.protocol && apt.status !== 'AGUARDANDO_APROVACAO' && (
                                        <a
                                            href={`/app/patients/${apt.patient.id}/protocol`}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Gerar IA
                                        </a>
                                    )}

                                    {(apt.protocol || apt.status === 'AGUARDANDO_APROVACAO') && (
                                        <a
                                            href={`/app/patients/${apt.patient.id}/protocol`}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Editar
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Protocolo */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-indigo-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Protocolo Pós-Consulta</h2>
                                    <p className="text-sm text-muted mt-1">
                                        {selectedAppointment.patient.name} - {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {selectedAppointment.status === 'AGUARDANDO_APROVACAO' ? (
                                <>
                                    <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-sm text-amber-400 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Este protocolo aguarda sua aprovação. Você pode editar antes de enviar.
                                        </p>
                                    </div>

                                    <textarea
                                        value={editedProtocol}
                                        onChange={(e) => setEditedProtocol(e.target.value)}
                                        className="w-full h-80 premium-input font-mono text-sm"
                                        placeholder="Protocolo será exibido aqui..."
                                    />

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={() => setSelectedAppointment(null)}
                                            className="px-4 py-2 text-slate-400 hover:text-white"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => approveProtocol(selectedAppointment.id, false)}
                                            disabled={approvingId === selectedAppointment.id}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
                                        >
                                            <Check className="w-4 h-4" />
                                            Aprovar (sem enviar)
                                        </button>
                                        <button
                                            onClick={() => approveProtocol(selectedAppointment.id, true)}
                                            disabled={approvingId === selectedAppointment.id}
                                            className="premium-button"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {approvingId === selectedAppointment.id ? 'Enviando...' : 'Aprovar e Enviar WhatsApp'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="prose prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans">
                                        {selectedAppointment.protocol}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
