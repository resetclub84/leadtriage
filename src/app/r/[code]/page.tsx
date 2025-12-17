import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import Link from 'next/link';
import {
    ArrowLeft, Heart, Star, TrendingDown, Users,
    Phone, CheckCircle, Target, Calendar
} from 'lucide-react';

interface ReferralPageProps {
    params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: ReferralPageProps): Promise<Metadata> {
    const { code } = await params;

    // Buscar paciente pelo código de referral
    const patient = await prisma.patient.findFirst({
        where: { referralCode: code }
    });

    const title = patient ? `Indicação de ${patient.name.split(' ')[0]}` : 'Programa RESET';

    return {
        title: `${title} | Gurgel Carrilho`,
        description: 'Transforme sua saúde com acompanhamento médico especializado. Programa de emagrecimento, performance e longevidade.',
        openGraph: {
            title: title,
            description: 'Transforme sua saúde com o Programa RESET - Emagrecimento, Performance e Longevidade',
        }
    };
}

export default async function ReferralLandingPage({ params }: ReferralPageProps) {
    const { code } = await params;

    // Buscar paciente pelo código de referral
    const patient = await prisma.patient.findFirst({
        where: { referralCode: code },
        include: {
            milestones: {
                orderBy: { achievedAt: 'desc' },
                take: 3
            }
        }
    });

    // Registrar clique na referral
    if (patient) {
        const existingReferral = await prisma.referral.findFirst({
            where: {
                referrerId: patient.id,
                clickedAt: null
            }
        });

        if (existingReferral) {
            await prisma.referral.update({
                where: { id: existingReferral.id },
                data: { clickedAt: new Date() }
            });
        }
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-serif text-white mb-4">Link inválido</h1>
                    <p className="text-slate-400 mb-6">Este link de indicação não é válido ou expirou.</p>
                    <Link href="/" className="text-indigo-400 hover:text-indigo-300">
                        Ir para o site principal →
                    </Link>
                </div>
            </div>
        );
    }

    const firstName = patient.name.split(' ')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            {/* Header simples */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="text-xl font-serif text-white">
                        <span className="text-indigo-400">GURGEL</span> CARRILHO
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge de indicação */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                        <Heart className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">Indicação de {firstName}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
                        Transforme sua
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                            saúde e performance
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                        {firstName} está em uma jornada de transformação e acredita que você também pode viver essa experiência.
                    </p>

                    {/* Conquistas do amigo */}
                    {patient.milestones && patient.milestones.length > 0 && (
                        <div className="flex justify-center gap-4 mb-8 flex-wrap">
                            {patient.milestones.map((milestone: any) => (
                                <div
                                    key={milestone.id}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                >
                                    <span className="text-xl">{milestone.badgeIcon}</span>
                                    <span className="text-sm text-amber-400">{milestone.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Principal */}
                    <a
                        href={`https://wa.me/5584999999999?text=Olá! Vim pela indicação de ${firstName} (código: ${code}). Gostaria de saber mais sobre o programa RESET.`}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
                    >
                        <Phone className="w-5 h-5" />
                        Quero Aplicar para o RESET
                    </a>
                    <p className="text-sm text-muted mt-4">Vagas limitadas • Atendimento personalizado</p>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="glass-card p-6 text-center">
                            <div className="text-3xl font-bold text-indigo-400 mb-1">500+</div>
                            <div className="text-sm text-slate-400">Pacientes transformados</div>
                        </div>
                        <div className="glass-card p-6 text-center">
                            <div className="text-3xl font-bold text-emerald-400 mb-1">5.000kg</div>
                            <div className="text-sm text-slate-400">Já perdidos coletivamente</div>
                        </div>
                        <div className="glass-card p-6 text-center">
                            <div className="text-3xl font-bold text-amber-400 mb-1">98%</div>
                            <div className="text-sm text-slate-400">Taxa de satisfação</div>
                        </div>
                        <div className="glass-card p-6 text-center">
                            <div className="text-3xl font-bold text-pink-400 mb-1">5★</div>
                            <div className="text-sm text-slate-400">Avaliação Google</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* O que é o programa */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 md:p-12">
                        <h2 className="text-2xl md:text-3xl font-serif text-white mb-6 text-center">
                            O Programa RESET
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Resultados Mensuráveis</h3>
                                    <p className="text-sm text-slate-400">Acompanhamento semanal com métricas claras de progresso</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Acompanhamento Médico</h3>
                                    <p className="text-sm text-slate-400">Dr. Matheus Gurgel e Dra. Íris - especialistas dedicados</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                                    <TrendingDown className="w-5 h-5 text-pink-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Emagrecimento Sustentável</h3>
                                    <p className="text-sm text-slate-400">Sem dietas restritivas ou fórmulas mágicas</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Programa Personalizado</h3>
                                    <p className="text-sm text-slate-400">Mínimo de 5 meses para resultados duradouros</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-12 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-lg text-slate-400 mb-6">
                        {firstName} confia no nosso trabalho e quer que você também transforme sua vida.
                    </p>

                    <a
                        href={`https://wa.me/5584999999999?text=Olá! Vim pela indicação de ${firstName} (código: ${code}). Gostaria de saber mais sobre o programa RESET.`}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
                    >
                        <Phone className="w-5 h-5" />
                        Falar com a Equipe
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-sm text-slate-500">
                        © 2025 Gurgel Carrilho. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                        CRM/RN 12345 | Natal - RN
                    </p>
                </div>
            </footer>
        </div>
    );
}
