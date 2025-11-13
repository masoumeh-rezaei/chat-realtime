'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, ChatUser } from '@/types/user';
import MessageList from './MessageList';
import { useSocket } from '@/context/SocketProvider';

interface ChatBodyProps {
    messages: ChatMessage[];
    me: ChatUser;
}

export default function ChatBody({ messages, me }: ChatBodyProps) {
    const { addReaction } = useSocket();
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isUserAtBottom, setIsUserAtBottom] = useState(true);
    const prevMessagesLength = useRef(messages.length);


    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        const atBottom =
            Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 5;

        setIsUserAtBottom(atBottom);
    };

    useEffect(() => {
        const container = containerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    // auto scroll
    useEffect(() => {
        const newMessageAdded = messages.length > prevMessagesLength.current;
        if (newMessageAdded && isUserAtBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessagesLength.current = messages.length;
    }, [messages, isUserAtBottom]);

    const handleReact = (messageId: string, emoji: string) => {
        addReaction(messageId, emoji);
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-hidden p-2 min-h-screen pt-17 mb-0 pb-0 "
        >
            <MessageList messages={messages} me={me} onReact={handleReact} />
            <div ref={messagesEndRef} />
        </div>
    );
}
