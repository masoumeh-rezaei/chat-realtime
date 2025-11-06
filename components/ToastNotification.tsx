'use client';
import React from 'react';
import { ChatMessage, ChatUser } from '@/types/user';
import Image from "next/image";

interface Props {
    message: ChatMessage;
    sender: ChatUser;
    onClick: () => void;
}

export const ToastNotification: React.FC<Props> = ({ message, sender, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white shadow-lg rounded-xl p-4 flex items-center gap-3 border cursor-pointer transition hover:bg-gray-50"
    >
        <Image  width={100} height={100} src={sender.avatar} alt="avatar" className="w-10 h-10 rounded-full border" />
        <div>
            <p className="font-semibold text-gray-800">پیام جدید از {sender.name}</p>
            <p className="text-gray-600 text-sm truncate max-w-[180px]">{message.text}</p>
        </div>
    </div>
);
