'use client';

import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChatUser } from '@/types/user';

interface ChatHeaderProps {
    user: ChatUser;
    onBack: () => void;
    isTyping?: boolean;
}

export default function ChatHeader({ user, onBack, isTyping }: ChatHeaderProps) {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm"
        >
            <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="بازگشت"
            >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>

            <Image
                src={user.avatar}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
            />

            <div className="flex flex-col">
                <p className="font-semibold text-gray-800">{user.name}</p>
                {isTyping ? (
                    <p className="text-xs text-indigo-500 animate-pulse">در حال تایپ...</p>
                ) : (
                    <p className="text-xs text-gray-500">آنلاین</p>
                )}
            </div>
        </motion.div>
    );
}
