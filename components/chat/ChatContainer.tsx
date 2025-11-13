'use client';
import React from 'react';
import { ChatUser } from '@/types/user';
import ChatHeader from './ChatHeader';
import ChatBody from './ChatBody';
import Composer from './Composer';
import { ChatMessage } from '@/types/user';

interface ChatContainerProps {
    me: ChatUser;
    partner: ChatUser;
    messages: ChatMessage[];
    onBack: () => void;
    onSend: (text: string,image?:string) => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
    isTyping: boolean;
}

export default function ChatContainer({
                                          me,
                                          partner,
                                          messages,
                                          onBack,
                                          onSend,
                                          onTypingStart,
                                          onTypingStop,
                                          isTyping,
                                      }: ChatContainerProps) {
    return (
        <div
            className="flex flex-col h-full  bg-cover bg-center relative "
            style={{
                backgroundImage: "url('/img/bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="md:absolute inset-0 bg-black/10 backdrop-blur-sm" />

            <div className="relative flex flex-col flex-1 ">
            <ChatHeader user={partner} onBack={onBack} isTyping={isTyping} />


                       <ChatBody messages={messages} me={me} />




                        <Composer
                            onSend={onSend}
                            onTypingStart={onTypingStart}
                            onTypingStop={onTypingStop}
                        />


            </div>
        </div>
    );
}
