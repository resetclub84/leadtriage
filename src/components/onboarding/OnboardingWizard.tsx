'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

// Progress Bar Component (estilo /// do STNDRD)
function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex gap-1 w-full max-w-md mx-auto mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < currentStep
                            ? 'bg-blue-500'
                            : i === currentStep
                                ? 'bg-blue-500/70'
                                : 'bg-gray-700'
                        }`}
                    style={{
                        transform: 'skewX(-20deg)',
                    }}
                />
            ))}
        </div>
    );
}

// Step indicator icon
function StepIcon() {
    return (
        <div className="flex gap-0.5 text-blue-500 mb-2">
            <div className="w-1 h-4 bg-blue-500 transform -skew-x-12 rounded-sm" />
            <div className="w-1 h-4 bg-blue-500 transform -skew-x-12 rounded-sm" />
            <div className="w-1 h-4 bg-blue-500 transform -skew-x-12 rounded-sm" />
        </div>
    );
}

interface OnboardingData {
    gender: string;
    birthDate: string;
    weight: number;
    height: number;
    fitnessLevel: string;
    trainingGoals: string[];
    nutritionGoals: string;
}

interface OnboardingWizardProps {
    patientId: string;
    patientName: string;
    onComplete: () => void;
}

export default function OnboardingWizard({ patientId, patientName, onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        gender: '',
        birthDate: '',
        weight: 0,
        height: 0,
        fitnessLevel: '',
        trainingGoals: [],
        nutritionGoals: '',
    });

    const totalSteps = 7;

    const nextStep = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const submitOnboarding = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/patients/${patientId}/onboarding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                // Show loading screen
                setStep(totalSteps);
                setTimeout(() => {
                    onComplete();
                }, 3000);
            }
        } catch (error) {
            console.error('Erro no onboarding:', error);
        }
        setLoading(false);
    };

    const steps = [
        // Step 0: Welcome
        {
            id: 'welcome',
            content: (
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-blue-600 rounded-2xl mx-auto mb-8 flex items-center justify-center"
                    >
                        <span className="text-white font-bold text-2xl italic">RESET</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-4">Bem-vindo ao RESET</h1>
                    <p className="text-gray-400 mb-8">
                        Olá, {patientName.split(' ')[0]}! Vamos configurar seu perfil para uma experiência personalizada.
                    </p>
                </div>
            ),
        },
        // Step 1: Gender
        {
            id: 'gender',
            content: (
                <div>
                    <StepIcon />
                    <h2 className="text-2xl font-bold mb-6">Qual é seu gênero?</h2>
                    <div className="flex gap-4">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g}
                                onClick={() => setData({ ...data, gender: g })}
                                className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${data.gender === g
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {g === 'male' ? 'Masculino' : 'Feminino'}
                                {data.gender === g && <Check className="inline ml-2 w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>
            ),
            isValid: () => data.gender !== '',
        },
        // Step 2: Birth Date
        {
            id: 'birthDate',
            content: (
                <div>
                    <StepIcon />
                    <h2 className="text-2xl font-bold mb-6">Quando você nasceu?</h2>
                    <div className="flex gap-4 max-w-md">
                        <input
                            type="date"
                            value={data.birthDate}
                            onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                            className="flex-1 bg-gray-800 border-none rounded-xl px-4 py-4 text-white text-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            ),
            isValid: () => data.birthDate !== '',
        },
        // Step 3: Weight
        {
            id: 'weight',
            content: (
                <div>
                    <StepIcon />
                    <h2 className="text-2xl font-bold mb-6">Qual é seu peso atual?</h2>
                    <div className="flex items-center gap-4 max-w-md">
                        <input
                            type="number"
                            value={data.weight || ''}
                            onChange={(e) => setData({ ...data, weight: parseFloat(e.target.value) || 0 })}
                            placeholder="Ex: 85.5"
                            className="flex-1 bg-gray-800 border-none rounded-xl px-4 py-4 text-white text-2xl focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="bg-blue-600 px-4 py-4 rounded-xl text-white font-medium">kg</span>
                    </div>
                </div>
            ),
            isValid: () => data.weight > 0,
        },
        // Step 4: Height
        {
            id: 'height',
            content: (
                <div>
                    <StepIcon />
                    <h2 className="text-2xl font-bold mb-6">Qual é sua altura?</h2>
                    <div className="flex items-center gap-4 max-w-md">
                        <input
                            type="number"
                            value={data.height || ''}
                            onChange={(e) => setData({ ...data, height: parseFloat(e.target.value) || 0 })}
                            placeholder="Ex: 175"
                            className="flex-1 bg-gray-800 border-none rounded-xl px-4 py-4 text-white text-2xl focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="bg-blue-600 px-4 py-4 rounded-xl text-white font-medium">cm</span>
                    </div>
                </div>
            ),
            isValid: () => data.height > 0,
        },
        // Step 5: Fitness Level
        {
            id: 'fitnessLevel',
            content: (
                <div>
                    <StepIcon />
                    <h2 className="text-2xl font-bold mb-6">Qual seu nível de condicionamento?</h2>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { id: 'beginner', label: 'Iniciante', bars: 1 },
                            { id: 'intermediate', label: 'Intermediário', bars: 2 },
                            { id: 'advanced', label: 'Avançado', bars: 3 },
                        ].map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setData({ ...data, fitnessLevel: level.id })}
                                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${data.fitnessLevel === level.id
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1 h-4 rounded-sm transform -skew-x-12 ${i < level.bars
                                                    ? data.fitnessLevel === level.id
                                                        ? 'bg-white'
                                                        : 'bg-blue-500'
                                                    : 'bg-gray-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                                {level.label}
                                {data.fitnessLevel === level.id && <Check className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>
            ),
            isValid: () => data.fitnessLevel !== '',
        },
        // Step 6: Nutrition Goals
        {
            id: 'nutritionGoals',
            content: (
                <div>
                    <StepIcon />
                    <h2 className="text-2xl font-bold mb-6">Qual seu objetivo principal?</h2>
                    <div className="grid grid-cols-2 gap-4 max-w-lg">
                        {[
                            { id: 'lose_weight', label: 'Perder Peso', emoji: '⬇️' },
                            { id: 'gain_weight', label: 'Ganhar Peso', emoji: '⬆️' },
                            { id: 'maintain', label: 'Manter Peso', emoji: '⚖️' },
                            { id: 'health', label: 'Melhorar Saúde', emoji: '💪' },
                        ].map((goal) => (
                            <button
                                key={goal.id}
                                onClick={() => setData({ ...data, nutritionGoals: goal.id })}
                                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${data.nutritionGoals === goal.id
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <span className="text-xl">{goal.emoji}</span>
                                {goal.label}
                                {data.nutritionGoals === goal.id && <Check className="w-5 h-5 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            ),
            isValid: () => data.nutritionGoals !== '',
        },
    ];

    // Loading/Optimizing screen
    if (step >= totalSteps) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    {/* Animated lines */}
                    <div className="relative w-64 h-32 mb-8">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute h-0.5 bg-blue-600 rounded-full"
                                style={{
                                    top: `${20 + i * 15}%`,
                                    left: '10%',
                                    right: '10%',
                                    transformOrigin: 'center',
                                }}
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{
                                    scaleX: [0, 1, 1, 0],
                                    opacity: [0, 1, 1, 0],
                                    x: ['-50%', '0%', '0%', '50%'],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>

                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    >
                        <span className="text-white font-bold text-xl italic">RESET</span>
                    </motion.div>

                    <h2 className="text-xl font-medium text-white mb-2">
                        Preparando seu Protocolo...
                    </h2>
                    <p className="text-gray-400">
                        Personalizando sua experiência
                    </p>
                </motion.div>
            </div>
        );
    }

    const currentStepData = steps[step];
    const canProceed = step === 0 || (currentStepData.isValid?.() ?? true);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header with back button */}
            {step > 0 && (
                <div className="p-4">
                    <button
                        onClick={prevStep}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Progress bar */}
            <div className="px-8">
                <ProgressBar currentStep={step} totalSteps={totalSteps} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center px-8 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStepData.content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer with CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black to-transparent">
                <button
                    onClick={step === totalSteps - 1 ? submitOnboarding : nextStep}
                    disabled={!canProceed || loading}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${canProceed
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : step === totalSteps - 1 ? (
                        'Finalizar'
                    ) : (
                        'Próximo'
                    )}
                </button>
            </div>
        </div>
    );
}
