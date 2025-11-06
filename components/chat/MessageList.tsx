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
        <div className="flex flex-col gap-2 px-2 py-3">
            {messages.map((msg) => {
                const isMine = msg.senderId === me.id;

                return (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={`relative group max-w-[75%] break-words px-4 py-2 rounded-2xl shadow-sm text-[13px] leading-relaxed
              ${isMine
                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white self-end rounded-br-none'
                            : 'bg-white/90 text-gray-800 self-start rounded-bl-none border border-gray-100'
                        }`}
                    >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {/* ساعت + وضعیت تیک */}
                        <div className={`flex items-center gap-1 text-[10px] mt-1 opacity-70 justify-end`}>
                            <span>{msg.time}</span>
                            {isMine && (
                                <>
                                    {msg.read ? (
                                        <CheckCheck size={13} className="text-blue-400" />
                                    ) :  (
                                        <Check size={13} className="text-gray-300" />
                                    ) }
                                </>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
