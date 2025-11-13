'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { ChatUser } from '@/types/user';
import ChatContainer from '@/components/chat/ChatContainer';

export default function ChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { onlineUsers, messages, sendMessage, login, typingUser, sendTyping, socket } = useSocket();

    const [me, setMe] = useState<ChatUser | null>(null);
    const [partner, setPartner] = useState<ChatUser | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        if (stored) {
            const parsed: ChatUser = JSON.parse(stored);
            setTimeout(() => {
                setMe(parsed);
                login(parsed);
            }, 0);
        } else {
            router.push('/login');
        }
    }, [login, router]);

    useEffect(() => {
        if (id && onlineUsers.length) {
            const user = onlineUsers.find((u) => u.id === id);
            startTransition(() => setPartner(user || null));
        }
    }, [id, onlineUsers]);

    // read messages
    useEffect(() => {
        if (!me || !partner || !socket) return;
        const unreadMessages = messages
            .filter((m) => m.receiverId === me.id && m.senderId === partner.id && !m.read)
            .map((m) => m.id);
        if (unreadMessages.length) {
            socket.emit('message:read', { messageIds: unreadMessages, userId: me.id });
        }
    }, [messages, me, partner, socket]);

    const handleSend = (text: string, image?: string) => {
        if (!text.trim() || !me || !partner) return;
        const conversationId = [me.id, partner.id].sort().join('-');
        sendMessage({
            senderId: me.id,
            receiverId: partner.id,
            text,
            image,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            conversationId,
        });
    };

    if (!me || !partner) return null;

    const conversationId = [me.id, partner.id].sort().join('-');
    const conversationMessages = messages.filter((m) => m.conversationId === conversationId);

    return (
        <ChatContainer
            me={me}
            partner={partner}
            messages={conversationMessages}
            onBack={() => router.push('/chat')}
            onSend={handleSend}
            onTypingStart={() => sendTyping(true, partner.id)}
            onTypingStop={() => sendTyping(false, partner.id)}
            isTyping={typingUser?.id === partner.id}
        />
    );
}
