'use client';
import Image from 'next/image';
import { ChatUser } from '@/types/user';

interface ChatUserCardProps {
    user: ChatUser;
    unreadCount: number;
    onClick: () => void;
}

export default function ChatUserCard({ user, unreadCount, onClick }: ChatUserCardProps) {
    return (
        <div
            onClick={onClick}
            className="relative flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow hover:shadow-md p-4 hover:bg-white transition cursor-pointer"
        >
            {/* آواتار */}
            <div className="relative">
                <Image
                    src={user.avatar}
                    alt={user.name}
                    width={50}
                    height={50}
                    className="rounded-full border border-indigo-300"
                />
                <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
            </div>

            {/* اطلاعات کاربر */}
            <div className="flex flex-col">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
            </div>

            {/* شمارنده پیام جدید */}
            {unreadCount > 0 && (
                <div className="absolute top-3 right-5 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                    {unreadCount} پیام جدید
                </div>
            )}
        </div>
    );
}
