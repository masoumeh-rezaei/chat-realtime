'use client';

import React, { createContext, useContext } from 'react';
import { useSocketHandler } from '@/hooks/useSocketHandler';
import { ChatUser, ChatMessage, UnreadCount } from '@/types/user';

interface SocketContextType {
    socket: ReturnType<typeof useSocketHandler>['socket'];
    onlineUsers: ChatUser[];
    messages: ChatMessage[];
    typingUser: ChatUser | null;
    unreadCount: UnreadCount;
    login: (user: ChatUser) => void;
    sendMessage: (msg: Omit<ChatMessage, 'id' | 'delivered' | 'read'>) => void;
    sendTyping: (isTyping: boolean, receiverId?: string) => void;
    markAsRead: (userId: string) => void;
    loadConversation: (conversationId: string) => Promise<void>;
    clearMessages: () => void;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socketHandler = useSocketHandler();

    return (
        <SocketContext.Provider value={socketHandler}>
            {children}
        </SocketContext.Provider>
    );
};
