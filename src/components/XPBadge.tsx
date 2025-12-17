'use client';

import { Trophy, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface XPBadgeProps {
    level: string; // 'bronze' | 'silver' | 'gold' | 'platinum'
    totalXP: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function XPBadge({ level, totalXP, size = 'md', showLabel = true }: XPBadgeProps) {
    const getLevelConfig = (lvl: string) => {
        switch (lvl) {
            case 'gold':
                return {
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-400/10',
                    border: 'border-yellow-400/20',
                    icon: <Trophy className={size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} />,
                    label: 'Gold',
                };
            case 'silver':
                return {
                    color: 'text-gray-300',
                    bg: 'bg-gray-300/10',
                    border: 'border-gray-300/20',
                    icon: <Medal className={size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} />,
                    label: 'Silver',
                };
            case 'platinum':
                return {
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-400/10',
                    border: 'border-cyan-400/20',
                    icon: <Star className={size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} />,
                    label: 'Platinum',
                };
            default: // bronze
                return {
                    color: 'text-orange-400',
                    bg: 'bg-orange-400/10',
                    border: 'border-orange-400/20',
                    icon: <Medal className={size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} />,
                    label: 'Bronze',
                };
        }
    };

    const config = getLevelConfig(level);
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-2 rounded-full border ${config.bg} ${config.border} ${config.color} ${sizeClasses[size]}`}
        >
            {config.icon}
            <span className="font-bold tabular-nums">{totalXP} XP</span>
            {showLabel && (
                <>
                    <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                    <span className="font-medium uppercase tracking-wider text-[0.9em]">
                        {config.label}
                    </span>
                </>
            )}
        </motion.div>
    );
}
