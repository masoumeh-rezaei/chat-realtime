'use client';
import { ChatUser } from '@/types/user';
import ChatUserCard from './ChatUserCard';

interface ChatUserListProps {
    me: ChatUser;
    onlineUsers: ChatUser[];
    unreadCount: Record<string, number>;
    onOpenChat: (user: ChatUser) => void;
}

export default function ChatUserList({
                                         me,
                                         onlineUsers,
                                         unreadCount,
                                         onOpenChat,
                                     }: ChatUserListProps) {
    const others = onlineUsers.filter((u) => u.id !== me.id);

    return (
        <>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
                کاربران  💬
            </h2>

            {others.length === 0 && (
                <p className="text-gray-500 italic">فعلاً کسی آنلاین نیست جز شما 😅</p>
            )}

            <div className="flex flex-col gap-3 mt-2">
                {others.map((u) => (
                    <ChatUserCard
                        key={u.id}
                        user={u}
                        unreadCount={unreadCount[u.id] || 0}
                        onClick={() => onOpenChat(u)}
                    />
                ))}
            </div>
        </>
    );
}
