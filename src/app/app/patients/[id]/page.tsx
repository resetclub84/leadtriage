'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, Edit2, Trash2, Plus, Clock, FileText, TrendingUp, Share2 } from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    phone: string;
    email?: string;
    cpf?: string;
    birthDate?: string;
    address?: string;
    city?: string;
    state?: string;
    notes?: string;
    status: string;
    createdAt: string;
    lead?: {
        id: string;
        source: string;
        triage?: {
            lead_score: string;
            interesse_principal: string;
        };
    };
    appointments: Array<{
        id: string;
        date: string;
        type: string;
        status: string;
        notes?: string;
    }>;
}

export default function PatientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetch(`/api/patients/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setPatient(data);
                    setLoading(false);
                });
        }
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este paciente?')) return;

        await fetch(`/api/patients/${params.id}`, { method: 'DELETE' });
        router.push('/app/patients');
    };

    if (loading) return (
        <div className="p-8 animate-fade-in">
            <div className="skeleton h-10 w-64 mb-6"></div>
            <div className="skeleton h-64"></div>
        </div>
    );

    if (!patient) return (
        <div className="p-8 text-center">
            <p className="text-muted">Paciente não encontrado</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/app/patients" className="p-2 rounded-lg hover:bg-white/5">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif font-semibold">{patient.name}</h1>
                        <p className="text-muted text-sm">Paciente desde {new Date(patient.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditing(true)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dados do Paciente */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-400" />
                            Dados Pessoais
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted">Telefone</p>
                                <p className="text-white flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-indigo-400" />
                                    {patient.phone}
                                </p>
                            </div>

                            {patient.email && (
                                <div>
                                    <p className="text-xs text-muted">Email</p>
                                    <p className="text-white flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-indigo-400" />
                                        {patient.email}
                                    </p>
                                </div>
                            )}

                            {patient.cpf && (
                                <div>
                                    <p className="text-xs text-muted">CPF</p>
                                    <p className="text-white">{patient.cpf}</p>
                                </div>
                            )}

                            {patient.birthDate && (
                                <div>
                                    <p className="text-xs text-muted">Data de Nascimento</p>
                                    <p className="text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-400" />
                                        {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}

                            {(patient.address || patient.city) && (
                                <div className="col-span-2">
                                    <p className="text-xs text-muted">Endereço</p>
                                    <p className="text-white flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        {[patient.address, patient.city, patient.state].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {patient.notes && (
                            <div className="mt-4 pt-4 border-t border-indigo-500/10">
                                <p className="text-xs text-muted mb-2">Notas</p>
                                <p className="text-white text-sm">{patient.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Timeline de Consultas */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                Histórico de Consultas
                            </h3>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                <Plus className="w-4 h-4" />
                                Agendar
                            </button>
                        </div>

                        {patient.appointments.length === 0 ? (
                            <div className="text-center py-8 text-muted">
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Nenhuma consulta agendada</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {patient.appointments.map(apt => (
                                    <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${apt.status === 'REALIZADO' ? 'bg-emerald-500/10 text-emerald-400' :
                                            apt.status === 'CANCELADO' ? 'bg-rose-500/10 text-rose-400' :
                                                'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {new Date(apt.date).toLocaleDateString('pt-BR')} - {apt.type}
                                            </p>
                                            <p className="text-sm text-muted">{apt.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="glass-card p-5">
                        <h4 className="text-sm text-muted mb-3">Status</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${patient.status === 'ATIVO'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : patient.status === 'ALTA'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}>
                            {patient.status}
                        </span>
                    </div>

                    {/* Origem */}
                    {patient.lead && (
                        <div className="glass-card p-5">
                            <h4 className="text-sm text-muted mb-3">Origem</h4>
                            <p className="text-white">Convertido de Lead</p>
                            <Link
                                href={`/app/leads/${patient.lead.id}`}
                                className="text-sm text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
                            >
                                Ver lead original →
                            </Link>

                            {patient.lead.triage && (
                                <div className="mt-3 pt-3 border-t border-indigo-500/10">
                                    <p className="text-xs text-muted">Score de Triagem</p>
                                    <p className="text-white capitalize">{patient.lead.triage.lead_score}</p>
                                    <p className="text-xs text-muted mt-2">Interesse Principal</p>
                                    <p className="text-white">{patient.lead.triage.interesse_principal}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ResultOS - Jornada do Paciente */}
                    <div className="glass-card p-5 bg-gradient-to-br from-indigo-500/10 to-pink-500/5 border border-indigo-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-sm font-medium text-white">ResultOS</h4>
                        </div>
                        <p className="text-xs text-muted mb-4">Acompanhe a jornada de transformação deste paciente</p>
                        <Link
                            href={`/app/patients/${patient.id}/journey`}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Ver Jornada Completa
                        </Link>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="glass-card p-5">
                        <h4 className="text-sm text-muted mb-3">Ações</h4>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm">
                                <Phone className="w-4 h-4" />
                                Enviar WhatsApp
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm">
                                <FileText className="w-4 h-4" />
                                Gerar Protocolo
                            </button>
                            <Link
                                href={`/app/patients/${patient.id}/journey`}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                Indicações
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
