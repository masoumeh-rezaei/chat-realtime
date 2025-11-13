'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChatUser, ChatMessage } from '@/types/user';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: ChatUser[];
    messages: ChatMessage[];
    typingUser: ChatUser | null;
    unreadCount: Record<string, number>;
    login: (user: ChatUser) => void;
    sendMessage: (msg: Omit<ChatMessage, 'id' | 'delivered' | 'read'>) => void;
    sendTyping: (isTyping: boolean, receiverId?: string) => void;
    markAsRead: (userId: string) => void;
    loadConversation: (conversationId: string) => Promise<void>;
    clearMessages: () => void;
    addReaction: (messageId: string, emoji: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
    messages: [],
    typingUser: null,
    unreadCount: {},
    login: () => {},
    sendMessage: () => {},
    sendTyping: () => {},
    markAsRead: () => {},
    loadConversation: async () => {},
    clearMessages: () => {},
    addReaction: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUser, setTypingUser] = useState<ChatUser | null>(null);
    const [unreadCount, setUnreadCount] = useState<Record<string, number>>({});
    const userRef = useRef<ChatUser | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const currentChatId = pathname.split('/').pop();

    // 🔹 loadConversation defined before useEffect
    const loadConversation = async (conversationId: string) => {
        try {
            const res = await fetch(`http://localhost:3001/conversations/${conversationId}`);
            const data: ChatMessage[] = await res.json();
            setMessages(data);
        } catch (err) {
            console.error(' Error loading conversation', err);
        }
    };

    // 🔹 Auto-load conversation on mount or when currentChatId changes
    useEffect(() => {
        if (!currentChatId) return;

        const fetchConversation = async () => {
            try {
                await loadConversation(currentChatId);
            } catch (err) {
                console.error(' Error loading conversation on mount', err);
            }
        };

        fetchConversation();
    }, [currentChatId]);

    // Connect to Socket with type-safe cleanup
    useEffect((): (() => void) => {
        const s = io('http://localhost:3001', { transports: ['websocket'] });

        s.on('connect', () => console.log(' Socket connected'));
        s.on('disconnect', () => console.log(' Socket disconnected'));
        s.on('presence:update', (users: ChatUser[]) => setOnlineUsers(users));

        // Receiving new messages
        s.on('message:recv', (msg: ChatMessage) => {
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));

            // New message notification
            if (userRef.current && msg.senderId !== userRef.current.id) {
                const chatId = pathname.split('/').pop();
                if (chatId !== msg.senderId) {
                    setUnreadCount((prev) => ({
                        ...prev,
                        [msg.senderId]: (prev[msg.senderId] || 0) + 1,
                    }));

                    const audio = new Audio('/sounds/notify.wav');
                    audio.play().catch(() => {});

                    toast.custom(
                        (t) => (
                            <div
                                onClick={() => {
                                    router.push(`/chat/${msg.senderId}`);
                                    toast.dismiss(t.id);
                                }}
                                className={`bg-white shadow-lg rounded-xl p-4 flex items-center gap-3 border cursor-pointer transition hover:bg-gray-50 ${
                                    t.visible ? 'animate-enter' : 'animate-leave'
                                }`}
                            >
                                <img
                                    src={`https://robohash.org/${msg.senderId}.png`}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full border"
                                />
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        پیام جدید از طرف  {msg.sender?.name || 'Anonymous'}
                                    </p>
                                    <p className="text-gray-600 text-sm truncate max-w-[180px]">
                                        {msg.text || '📷 New photo'}
                                    </p>
                                </div>
                            </div>
                        ),
                        { duration: 5000, position: 'top-right' }
                    );
                }
            }
        });

        // Message delivered
        s.on('message:delivered', (messageId: string) => {
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, delivered: true } : m)));
        });

        // Message read updates
        s.on('message:read:update', (ids: string[]) => {
            setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, read: true } : m)));
        });

        // Typing indicator
        s.on('user:typing', ({ user, typing }) => {
            setTypingUser(typing ? user : null);
        });

        // Message reactions
        s.on('message:reaction', ({ messageId, emoji, userId, username }) => {
            setMessages((prev) =>
                prev.map((m) => {
                    if (m.id !== messageId) return m;
                    const reactions: Record<string, { userId: string; username: string }[]> = m.reactions || {};

                    // Remove previous reactions from this user
                    for (const key in reactions) {
                        reactions[key] = reactions[key].filter((r) => r.userId !== userId);
                        if (reactions[key].length === 0) delete reactions[key];
                    }

                    // Add new reaction
                    if (!reactions[emoji]) reactions[emoji] = [];
                    reactions[emoji].push({ userId, username });

                    return { ...m, reactions };
                })
            );
        });

        setSocket(s);
        return () => s.disconnect();
    }, [pathname]);

    // User login
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

    // Send message (text or image)
    const sendMessage = (msg: Omit<ChatMessage, 'id' | 'delivered' | 'read'>) => {
        if (!socket || !userRef.current) return;

        const message: ChatMessage = {
            ...msg,
            id: uuidv4(),
            delivered: false,
            read: false,
            reactions: msg.reactions || {},
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        };

        socket.emit('message:send', message);
        setMessages((prev) => [...prev, message]);
    };

    const sendTyping = (isTyping: boolean, receiverId?: string) => {
        if (!socket || !userRef.current) return;
        socket.emit(isTyping ? 'typing:start' : 'typing:stop', { user: userRef.current, receiverId });
    };

    const markAsRead = (userId: string) => {
        setUnreadCount((prev) => ({ ...prev, [userId]: 0 }));
    };

    const clearMessages = () => setMessages([]);

    const addReaction = (messageId: string, emoji: string) => {
        if (!socket || !userRef.current) return;
        socket.emit('message:react', { messageId, emoji, userId: userRef.current.id });
    };

    return (
        <SocketContext.Provider
            value={{
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
                addReaction,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
