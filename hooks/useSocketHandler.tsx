'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChatUser, ChatMessage, UnreadCount } from '@/types/user';
import { ToastNotification } from '@/components/ToastNotification';

export const useSocketHandler = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUser, setTypingUser] = useState<ChatUser | null>(null);
    const [unreadCount, setUnreadCount] = useState<UnreadCount>({});

    const userRef = useRef<ChatUser | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // 🧩 اتصال به Socket.io و مدیریت eventها
    useEffect(() => {
        const s: Socket = io('http://localhost:3001', { transports: ['websocket'] });

        s.on('connect', () => console.log('✅ Socket connected'));
        s.on('disconnect', () => console.log('❌ Socket disconnected'));
        s.on('presence:update', (users: ChatUser[]) => setOnlineUsers(users));

        s.on('message:recv', (msg: ChatMessage) => {
            setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));

            if (userRef.current && msg.senderId !== userRef.current.id) {
                const currentChatId = pathname.split('/').pop();

                if (currentChatId !== msg.senderId) {
                    setUnreadCount(prev => ({
                        ...prev,
                        [msg.senderId]: (prev[msg.senderId] || 0) + 1,
                    }));

                    const audio = new Audio('/sounds/notify.wav');
                    audio.play().catch(() => {});

                    const sender =
                        msg.sender ||
                        onlineUsers.find(u => u.id === msg.senderId) ||
                        JSON.parse(localStorage.getItem(`user_${msg.senderId}`) || 'null') ||
                        {
                            name: 'کاربر ناشناس',
                            username: msg.senderId.slice(0, 6),
                            avatar: `https://robohash.org/${msg.senderId}.png`,
                        };

                    toast.custom(
                        t => (
                            <ToastNotification
                                message={msg}
                                sender={sender}
                                onClick={() => {
                                    router.push(`/chat/${msg.senderId}`);
                                    toast.dismiss(t.id);
                                }}
                            />
                        ),
                        { duration: 5000, position: 'top-right' }
                    );
                }
            }
        });

        s.on('message:delivered', (messageId: string) => {
            setMessages(prev =>
                prev.map(m => (m.id === messageId ? { ...m, delivered: true } : m))
            );
        });

        s.on('message:read:update', (ids: string[]) => {
            setMessages(prev =>
                prev.map(m => (ids.includes(m.id) ? { ...m, read: true } : m))
            );
        });

        s.on('user:typing', ({ user, typing }: { user: ChatUser; typing: boolean }) =>
            setTypingUser(typing ? user : null)
        );

        setSocket(s);

        // 🔹 Cleanup function صریح
        return (): void => {
            s.disconnect();
        };
    }, [pathname, onlineUsers, router]);

    // 🔸 ورود یوزر از sessionStorage
    useEffect(() => {
        if (!socket) return;

        const stored = sessionStorage.getItem('user');
        if (stored) {
            const parsed: ChatUser = JSON.parse(stored);
            userRef.current = parsed;
            socket.emit('login', parsed);
        }
    }, [socket]);

    const login = (user: ChatUser) => {
        userRef.current = user;
        sessionStorage.setItem('user', JSON.stringify(user));
        socket?.emit('login', user);
    };

    const sendMessage = (msg: Omit<ChatMessage, 'id' | 'delivered' | 'read'>) => {
        if (!socket || !userRef.current) return;

        const message: ChatMessage = {
            ...msg,
            id: uuidv4(),
            delivered: false,
            read: false,
        };

        socket.emit('message:send', message);
        setMessages(prev => [...prev, message]);
    };

    const sendTyping = (isTyping: boolean, receiverId?: string) => {
        if (!socket || !userRef.current) return;

        socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
            user: userRef.current,
            receiverId,
        });
    };

    const markAsRead = (userId: string) => setUnreadCount(prev => ({ ...prev, [userId]: 0 }));

    const loadConversation = async (conversationId: string) => {
        try {
            const res = await fetch(`http://localhost:3001/conversations/${conversationId}`);
            const data: ChatMessage[] = await res.json();
            setMessages(data);
        } catch (err) {
            console.error('❌ Error loading conversation', err);
        }
    };

    const clearMessages = () => setMessages([]);

    return {
        socket,
        onlineUsers,
        messages,
        typingUser,
        unreadCount,
        login,
        sendMessage,
        sendTyping,
        markAsRead,
        loadConversation,
        clearMessages,
    };
};
