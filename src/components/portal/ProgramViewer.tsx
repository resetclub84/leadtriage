'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Utensils, Pill, ChevronRight } from 'lucide-react';

interface ProgramViewerProps {
    protocol: string;
}

export default function ProgramViewer({ protocol }: ProgramViewerProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'nutrition' | 'workout' | 'supplements'>('all');

    // Simple heuristic to split content if the AI followed the structure
    // This assumes the AI used headers like "# 1. Estratégia Nutricional" etc.
    // If not, we show "all".

    // Helper to filter content (basic regex implementation for MVP)
    const getContent = () => {
        if (activeTab === 'all') return protocol;

        const lines = protocol.split('\n');
        let inSection = false;
        let content = [];

        const keywords = {
            nutrition: ['nutricional', 'dieta', 'nutrition', 'alimentação'],
            workout: ['treino', 'workout', 'exercício', 'training'],
            supplements: ['suplementação', 'suplementos', 'supplements']
        };

        for (const line of lines) {
            if (line.startsWith('#')) {
                const lower = line.toLowerCase();
                if (keywords[activeTab].some(k => lower.includes(k))) {
                    inSection = true;
                    content.push(line);
                    continue;
                } else if (inSection) {
                    // Stop if we hit another main header
                    if (line.startsWith('# ') || line.startsWith('## ')) {
                        inSection = false;
                    }
                }
            }
            if (inSection) {
                content.push(line);
            }
        }

        return content.length > 0 ? content.join('\n') : "Seção não encontrada ou protocolo não segue o padrão. Veja em 'Visão Geral'.";
    };

    const tabs = [
        { id: 'all', label: 'Visão Geral', icon: ChevronRight },
        { id: 'nutrition', label: 'Nutrição', icon: Utensils },
        { id: 'workout', label: 'Treino', icon: Dumbbell },
        { id: 'supplements', label: 'Suplementos', icon: Pill },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-6 min-h-[400px]"
                >
                    <div className="prose prose-invert prose-blue max-w-none">
                        <ReactMarkdown>{activeTab === 'all' ? protocol : getContent()}</ReactMarkdown>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
