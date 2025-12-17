'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProtocolEditorProps {
    patientId: string;
    initialProtocol: string | null;
}

export default function ProtocolEditor({ patientId, initialProtocol }: ProtocolEditorProps) {
    const [protocol, setProtocol] = useState(initialProtocol || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/patients/${patientId}/protocol/generate`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setProtocol(data.protocol);
                setMessage({ type: 'success', text: 'Protocolo gerado com sucesso! Revise antes de salvar.' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Erro ao gerar.' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Erro de conexão.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/patients/${patientId}/protocol`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ protocol })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Protocolo salvo com sucesso!' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao salvar.' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Erro de conexão.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendWhatsApp = () => {
        // Sprint 16 Integration (Simple Link for now)
        // In verify, we can implement the full WhatsApp integration
        // For now, just a placeholder or manual link
        const text = encodeURIComponent(`Olá! Aqui está o seu protocolo atualizado:\n\n${protocol}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-white">Editar Protocolo</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`premium-button ${isGenerating ? 'opacity-50' : ''}`}
                    >
                        {isGenerating ? 'Gerando com IA...' : '✨ Gerar Sugestão IA'}
                    </button>
                    {protocol && (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <button
                                onClick={handleSendWhatsApp}
                                className="px-4 py-2 rounded-xl bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/30 transition-colors"
                            >
                                Enviar WhatsApp
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Message Toast */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border text-sm text-center ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Editor Area */}
            <div className="glass-card p-4 min-h-[500px] relative">
                {isGenerating && (
                    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-blue-500 animate-pulse font-medium">Analisando dados do paciente...</div>
                    </div>
                )}
                <textarea
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    placeholder="O protocolo gerado aparecerá aqui. Você pode editar livremente."
                    className="w-full h-[500px] bg-transparent text-gray-300 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                    spellCheck={false}
                />
            </div>

            <p className="text-xs text-gray-500 text-center">
                * A IA utiliza dados de peso, altura e objetivos para sugerir este plano. Sempre revise antes de enviar.
            </p>
        </div>
    );
}
