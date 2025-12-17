'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MedicalDisclaimer({ onAccept }: { onAccept?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    // Check if user already accepted in this session
    useEffect(() => {
        const accepted = sessionStorage.getItem('medical_disclaimer_accepted');
        if (accepted === 'true') {
            setIsVisible(false);
        }
    }, []);

    const handleAccept = () => {
        sessionStorage.setItem('medical_disclaimer_accepted', 'true');
        setIsVisible(false);
        onAccept?.();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-700 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Aviso Importante</h2>
                </div>

                <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                    <p>
                        O <strong>Coach IA</strong> é um assistente virtual baseado em Inteligência Artificial.
                    </p>
                    <p className="font-semibold text-amber-400">
                        ⚠️ Ele NÃO substitui consulta médica, nutricional ou de qualquer profissional de saúde.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                        <li>As respostas são apenas informativas.</li>
                        <li>Não tome decisões de saúde baseadas apenas na IA.</li>
                        <li>Consulte seu médico para qualquer dúvida.</li>
                        <li>Em emergências, ligue SAMU (192).</li>
                    </ul>
                </div>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleAccept}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                    >
                        Entendi e Aceito
                    </button>
                    <p className="text-center text-xs text-zinc-500">
                        Ao continuar, você concorda com nossos{' '}
                        <Link href="/legal/terms" className="text-blue-500 hover:underline">Termos de Uso</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
