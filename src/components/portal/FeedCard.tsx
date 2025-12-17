'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FeedItem {
    id: string;
    title: string;
    description: string | null;
    badgeIcon: string | null;
    user: {
        name: string;
        location: string;
    };
    timeAgo: string;
}

export default function FeedCard({ item }: { item: FeedItem }) {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(Math.floor(Math.random() * 5)); // Fake initial likes

    const handleLike = () => {
        if (!liked) {
            setLiked(true);
            setLikes(p => p + 1);
            // Todo: Call API to persist like
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 border border-zinc-800/50"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-inner border border-zinc-700">
                    {item.badgeIcon || '🏆'}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-white font-medium text-sm">{item.title}</h3>
                        <span className="text-[10px] text-zinc-500">{item.timeAgo}</span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-0.5">{item.user.name} • {item.user.location}</p>

                    {item.description && (
                        <p className="text-zinc-500 text-xs mt-2 italic border-l-2 border-zinc-700 pl-2">
                            "{item.description}"
                        </p>
                    )}

                    <div className="mt-3 flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? 'text-pink-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500' : ''}`} />
                            {likes > 0 ? likes : 'Aplaudir'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
