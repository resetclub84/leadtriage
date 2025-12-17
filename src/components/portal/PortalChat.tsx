'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export default function PortalChat({ code, userName }: { code: string, userName?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: `Olá! Sou seu Coach IA. Alguma dúvida sobre seu treino ou dieta hoje? 💪` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Convert app State to Gemini History format
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const res = await fetch('/api/portal/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    accessCode: code,
                    history
                })
            });

            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
            } else {
                throw new Error(data.error || 'Erro na resposta');
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: '⚠️ Tive um problema de conexão. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <MessageCircle className="w-7 h-7" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:right-4 md:w-96 md:h-[600px] flex flex-col"
                    >
                        <div className="flex-1 bg-zinc-900 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-800">

                            {/* Header */}
                            <div className="p-4 bg-zinc-800 flex items-center justify-between border-b border-zinc-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium text-sm">Coach IA</h3>
                                        <p className="text-zinc-400 text-xs flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 backdrop-blur-sm">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-zinc-800 rounded-2xl px-4 py-3 rounded-bl-none flex gap-1 items-center">
                                            <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
                                            <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-75" />
                                            <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-150" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-zinc-800 border-t border-zinc-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Digite sua dúvida..."
                                        className="flex-1 bg-zinc-900 text-white rounded-full px-4 py-3 text-sm border border-zinc-700 focus:outline-none focus:border-blue-600"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
