'use client';
import React from 'react';
import { ChatMessage } from '@/types/user';
import { ChatUser } from '@/types/user';
import MessageList from './MessageList';

interface ChatBodyProps {
    messages: ChatMessage[];
    me: ChatUser;
}

export default function ChatBody({ messages, me }: ChatBodyProps) {
    return (
        <div className="flex flex-col flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} me={me} />
        </div>
    );
}
