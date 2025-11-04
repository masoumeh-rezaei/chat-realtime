'use client';
import Image from 'next/image';
import { ChatUser } from '@/types/user';

interface ChatHeaderProps {
    me: ChatUser;
}

export default function ChatHeader({ me }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-indigo-700">👋 سلام، {me.name}!</h1>
                <p className="text-gray-500 text-sm">@{me.username}</p>
            </div>
            <Image
                src={me.avatar}
                alt={me.name}
                width={56}
                height={56}
                className="rounded-full border-2 border-indigo-400 shadow-md"
            />
        </div>
    );
}
