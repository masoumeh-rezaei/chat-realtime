'use client';
import { useSocket } from '@/components/SocketProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatUser } from '@/types/user';
import ChatHeader from '@/components/chat/Header/ChatHeader';
import ChatUserList from '@/components/chat/ChatUserList';

export default function ChatsPage() {
    const { onlineUsers, login, unreadCount, markAsRead } = useSocket();
    const router = useRouter();
    const [me, setMe] = useState<ChatUser | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        if (stored) {
            const parsed: ChatUser = JSON.parse(stored);
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
            <ChatHeader me={me} />
            <ChatUserList
                me={me}
                onlineUsers={onlineUsers}
                unreadCount={unreadCount}
                onOpenChat={openChat}
            />
        </div>
    );
}
