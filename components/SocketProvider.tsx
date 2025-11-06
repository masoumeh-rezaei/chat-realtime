'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
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

    // 🧩 اتصال به Socket.io
    useEffect(() => {
        const s = io('http://localhost:3001', { transports: ['websocket'] });

        s.on('connect', () => console.log('✅ Socket connected'));
        s.on('disconnect', () => console.log('❌ Socket disconnected'));
        s.on('presence:update', (users: ChatUser[]) => setOnlineUsers(users));

        // 📩 دریافت پیام جدید
        s.on('message:recv', (msg: ChatMessage) => {
            setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));

            // اگه پیام از طرف مقابل بود و توی چتش نیست
            if (userRef.current && msg.senderId !== userRef.current.id) {
                const currentChatId = pathname.split('/').pop();

                if (currentChatId !== msg.senderId) {
                    // افزایش شمارنده پیام‌های ناخوانده
                    setUnreadCount(prev => ({
                        ...prev,
                        [msg.senderId]: (prev[msg.senderId] || 0) + 1,
                    }));

                    // 🔔 پخش صدای اعلان
                    const audio = new Audio('/sounds/notify.wav');
                    audio.play().catch(() => {});
                    // 🔹 پیدا کردن اطلاعات فرستنده
                    const sender =
                        msg.sender || // اگه سرور خودش فرستاده باشه
                        onlineUsers.find(u => u.id === msg.senderId) || // اگه آنلاین بود
                        JSON.parse(localStorage.getItem(`user_${msg.senderId}`) || 'null') || // اگر قبلاً کش شده بود
                        {
                            name: 'کاربر ناشناس',
                            username: msg.senderId.slice(0, 6),
                            avatar: `https://robohash.org/${msg.senderId}.png`,
                        };



                    // 💬 نمایش Toast قابل کلیک
                    toast.custom(
                        t => (
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
                                        پیام جدید از {sender.name}
                                    </p>
                                    <p className="text-gray-600 text-sm truncate max-w-[180px]">
                                        {msg.text}
                                    </p>
                                </div>
                            </div>
                        ),
                        { duration: 5000, position: 'top-right' }
                    );
                }
            }
        });

        // 🟢 پیام تحویل داده شد
        s.on('message:delivered', (messageId: string) => {
            setMessages(prev =>
                prev.map(m => (m.id === messageId ? { ...m, delivered: true } : m))
            );
        });

        // 🔵 پیام خوانده شد
        s.on('message:read:update', (ids: string[]) => {
            setMessages(prev =>
                prev.map(m => (ids.includes(m.id) ? { ...m, read: true } : m))
            );
        });

        // ✍️ تایپینگ
        s.on('user:typing', ({ user, typing }) => {
            setTypingUser(typing ? user : null);
        });

        setSocket(s);
        return () => {
            s.disconnect();
        };
    }, [pathname, router]);

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

    // ✉️ ارسال پیام
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

    // ⌨️ وضعیت تایپینگ
    const sendTyping = (isTyping: boolean, receiverId?: string) => {
        if (!socket || !userRef.current) return;
        socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
            user: userRef.current,
            receiverId,
        });
    };

    // 🔕 صفر کردن پیام‌های ناخوانده

    const markAsRead = (userId: string) => {
        if (!socket || !userRef.current) return;

        // صفر کردن شمارنده
        setUnreadCount(prev => ({ ...prev, [userId]: 0 }));

        // پیدا کردن پیام‌های ناخوانده
        const unreadMessages = messages
            .filter(m => m.senderId === userId && !m.read)
            .map(m => m.id);

        if (unreadMessages.length) {
            socket.emit('message:read', {
                messageIds: unreadMessages,
                userId: userRef.current.id,
            });
        }
    };


    // 🗂️ لود گفتگو
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
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
