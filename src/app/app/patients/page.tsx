'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Phone, Mail, Calendar, UserCheck, UserX } from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    phone: string;
    email?: string;
    status: string;
    createdAt: string;
    lead?: { source: string };
    _count: { appointments: number };
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch('/api/patients')
            .then(res => res.json())
            .then(data => {
                setPatients(data);
                setLoading(false);
            });
    }, []);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search)
    );

    if (loading) return (
        <div className="p-8 animate-fade-in">
            <div className="space-y-6">
                <div className="skeleton h-10 w-64"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-40"></div>)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-semibold">Pacientes</h1>
                    <p className="text-muted text-sm mt-1">Gerencie sua base de pacientes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="premium-button flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Novo Paciente
                </button>
            </div>

            {/* Barra de Busca */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou telefone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="premium-input pl-12"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{patients.length}</p>
                        <p className="text-sm text-muted">Total</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{patients.filter(p => p.status === 'ATIVO').length}</p>
                        <p className="text-sm text-muted">Ativos</p>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                        <UserX className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{patients.filter(p => p.status !== 'ATIVO').length}</p>
                        <p className="text-sm text-muted">Inativos</p>
                    </div>
                </div>
            </div>

            {/* Grid de Pacientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map(patient => (
                    <Link
                        key={patient.id}
                        href={`/app/patients/${patient.id}`}
                        className="glass-card p-5 hover:border-indigo-500/40 cursor-pointer"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate">{patient.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted mt-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{patient.phone}</span>
                                </div>
                                {patient.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted mt-1">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{patient.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className={`px-2 py-1 rounded-full ${patient.status === 'ATIVO'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-slate-500/10 text-slate-400'
                                }`}>
                                {patient.status}
                            </span>
                            <span className="text-muted flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {patient._count.appointments} consultas
                            </span>
                        </div>

                        {patient.lead && (
                            <div className="mt-3 pt-3 border-t border-indigo-500/10">
                                <span className="text-xs text-indigo-400">
                                    Convertido de lead ({patient.lead.source})
                                </span>
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {filteredPatients.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white">Nenhum paciente encontrado</h3>
                    <p className="text-muted mt-2">
                        {search ? 'Tente outra busca' : 'Adicione seu primeiro paciente'}
                    </p>
                </div>
            )}

            {/* Modal Novo Paciente */}
            {showModal && (
                <NewPatientModal onClose={() => setShowModal(false)} onCreated={() => {
                    setShowModal(false);
                    fetch('/api/patients').then(r => r.json()).then(setPatients);
                }} />
            )}
        </div>
    );
}

function NewPatientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        cpf: '',
        birthDate: '',
        address: '',
        city: '',
        state: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const res = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        if (res.ok) {
            onCreated();
        } else {
            const err = await res.json();
            alert(err.error);
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg p-6 m-4">
                <h2 className="text-xl font-semibold text-white mb-6">Novo Paciente</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm text-muted mb-1">Nome *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="premium-input"
                                placeholder="Nome completo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted mb-1">Telefone *</label>
                            <input
                                type="tel"
                                required
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="premium-input"
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="premium-input"
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted mb-1">CPF</label>
                            <input
                                type="text"
                                value={form.cpf}
                                onChange={e => setForm({ ...form, cpf: e.target.value })}
                                className="premium-input"
                                placeholder="000.000.000-00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted mb-1">Data de Nascimento</label>
                            <input
                                type="date"
                                value={form.birthDate}
                                onChange={e => setForm({ ...form, birthDate: e.target.value })}
                                className="premium-input"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm text-muted mb-1">Endereço</label>
                            <input
                                type="text"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                className="premium-input"
                                placeholder="Rua, número, bairro"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted mb-1">Cidade</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })}
                                className="premium-input"
                                placeholder="São Paulo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted mb-1">Estado</label>
                            <input
                                type="text"
                                maxLength={2}
                                value={form.state}
                                onChange={e => setForm({ ...form, state: e.target.value.toUpperCase() })}
                                className="premium-input"
                                placeholder="SP"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="premium-button">
                            {saving ? 'Salvando...' : 'Cadastrar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
