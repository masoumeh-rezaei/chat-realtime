'use client';
import { useSocket } from '@/components/SocketProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChatUser } from '@/types/user';

export default function ChatsPage() {
    const { onlineUsers, login, unreadCount, markAsRead } = useSocket();
    const router = useRouter();
    const [me, setMe] = useState<ChatUser | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        if (stored) {
            const parsed: ChatUser = JSON.parse(stored);
            // رفع هشدار ESLint با Promise
            Promise.resolve().then(() => {
                setMe(parsed);
                login(parsed);
            });
        } else {
            router.push('/login');
        }
    }, [login, router]);

    const openChat = (u: ChatUser) => {
        markAsRead(u.id);
        router.push(`/chat/${u.id}`);
    };

    if (!me) return null;

    return (
        <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-indigo-50 to-cyan-100 p-6">
            {/* 🧑‍💻 هدر بالا */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-700">
                        👋 سلام، {me.name}!
                    </h1>
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

            {/* 🔹 تیتر کاربران آنلاین */}
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
                کاربران آنلاین 💬
            </h2>

            {onlineUsers.length === 1 && (
                <p className="text-gray-500 italic">فعلاً کسی آنلاین نیست جز شما 😅</p>
            )}

            {/* 🔹 لیست کاربران */}
            <div className="flex flex-col gap-3 mt-2">
                {onlineUsers
                    .filter(u => u.id !== me.id)
                    .map(u => (
                        <div
                            key={u.id}
                            onClick={() => openChat(u)}
                            className="relative flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow hover:shadow-md p-4 hover:bg-white transition cursor-pointer"
                        >
                            {/* آواتار */}
                            <div className="relative">
                                <Image
                                    src={u.avatar}
                                    alt={u.name}
                                    width={50}
                                    height={50}
                                    className="rounded-full border border-indigo-300"
                                />
                                <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                            </div>

                            {/* نام کاربر */}
                            <div className="flex flex-col">
                                <p className="font-semibold text-gray-800">{u.name}</p>
                                <p className="text-sm text-gray-500">@{u.username}</p>
                            </div>

                            {/* 🔔 شمارنده پیام جدید */}
                            {unreadCount[u.id] > 0 && (
                                <div className="absolute top-3 right-5 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                    {unreadCount[u.id]} پیام جدید
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}
