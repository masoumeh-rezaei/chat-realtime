'use client';

import React, { useState } from 'react';
import { ChatMessage, ChatUser } from '@/types/user';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Smile, X } from 'lucide-react';

interface MessageListProps {
    messages: ChatMessage[];
    me: ChatUser;
    onReact?: (messageId: string, emoji: string) => void;
}

const emojis = ['❤️', '😂', '👍', '😢', '🔥', '👏'];

export default function MessageList({ messages, me, onReact }: MessageListProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null); // ✅ برای بزرگ‌نمایی عکس

    return (
        <div className="flex flex-col gap-3 p-3">
            {messages.map((msg) => {
                const isMine = msg.senderId === me.id;
                const hasImage = !!msg.image;

                return (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`relative group max-w-[75%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                            isMine
                                ? 'bg-blue-600 text-white self-end rounded-br-none'
                                : 'bg-white text-gray-800 self-start rounded-bl-none '
                        }`}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setShowEmojiPicker((prev) => (prev === msg.id ? null : msg.id));
                        }}
                    >
                        {/* 🖼️ تصویر پیام */}
                        {hasImage && (
                            <img
                                src={msg.image}
                                alt="sent"
                                className="rounded-lg mb-2 max-h-60 object-cover cursor-pointer hover:opacity-90 transition"
                                onClick={() => setPreview(msg.image!)} // ✅ جایگزین window.open
                            />
                        )}

                        {/* 💬 متن پیام */}
                        {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                        {/* 🕓 ساعت و تیک‌ها */}
                        <div className="flex justify-end items-center gap-1 text-[10px] mt-1 opacity-70">
                            <span>{msg.time}</span>
                            {isMine && (
                                <>
                                    {msg.read ? (
                                        <CheckCheck size={13} className="text-blue-300" />
                                    ) : (
                                        <Check size={13} className="text-gray-300" />
                                    )}
                                </>
                            )}
                        </div>

                        {/* 😊 پاپ‌آپ ایموجی‌ها */}
                        {showEmojiPicker === msg.id && (
                            <div
                                className={`absolute bottom-full mb-2 bg-white shadow-md rounded-xl px-2 py-1 flex gap-2 z-50 ${
                                    isMine ? '-right-2 origin-bottom-left' : '-left-2 origin-bottom-right'
                                }`}
                            >
                                {emojis.map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => {
                                            setShowEmojiPicker(null);
                                            onReact?.(msg.id, e);
                                        }}
                                        className="text-lg hover:scale-125 transition"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>

                        )}

                        {/* ❤️ واکنش‌ها */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-2 mt-1">
                                {Object.entries(msg.reactions).map(([emoji, users]) => {
                                    // فقط آخرین کاربر که این ایموجی را زده
                                    const lastReaction = users[users.length - 1];
                                    return (
                                        <span
                                            key={emoji}
                                            className="text-xs bg-white/30 text-gray-700 rounded-full px-2 py-0.5 flex items-center gap-1"
                                        >
                    {emoji} {lastReaction?.username}
                </span>
                                    );
                                })}
                            </div>
                        )}



                        {/* 😊 آیکون ری‌اکشن سریع */}
                        <button
                            className={`absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition`}
                            onClick={() =>
                                setShowEmojiPicker((prev) => (prev === msg.id ? null : msg.id))
                            }
                        >
                            <Smile size={16} className="text-gray-400 hover:text-yellow-400" />
                        </button>
                    </motion.div>
                );
            })}

            {/* 🖼️ مودال بزرگ‌نمایی عکس */}
            {preview && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setPreview(null)}
                >
                    <div className="relative">
                        <img
                            src={preview}
                            alt="preview"
                            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                        />
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
