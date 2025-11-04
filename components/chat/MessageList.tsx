'use client';

import React from 'react';
import { ChatMessage, ChatUser } from '@/types/user';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

interface MessageListProps {
    messages: ChatMessage[];
    me: ChatUser;
}

export default function MessageList({ messages, me }: MessageListProps) {
    return (
        <div className="flex flex-col gap-3">
            {messages.map(msg => {
                const isMine = msg.senderId === me.id;

                return (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                            isMine
                                ? 'bg-indigo-600 text-white self-end rounded-br-none'
                                : 'bg-white text-gray-800 self-start rounded-bl-none'
                        }`}
                    >
                        <p>{msg.text}</p>

                        <div className="flex justify-end items-center gap-1 text-[10px] mt-1 opacity-70">
                            <span>{msg.time}</span>
                            {isMine && (
                                <>
                                    {msg.read ? (
                                        <CheckCheck size={13} className="text-blue-400" />
                                    ) : msg.delivered ? (
                                        <CheckCheck size={13} className="text-gray-300" />
                                    ) : (
                                        <Check size={13} className="text-gray-300" />
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
