'use client';

import { Send, Image as ImageIcon, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from "next/image";

interface ComposerProps {
    onSend: (text: string, image?: string) => void;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
}

export default function Composer({ onSend, onTypingStart, onTypingStop }: ComposerProps) {
    const [text, setText] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = () => {

        if (text.trim() === '' && !image) return;

        onSend(text.trim(), image || undefined);
        setText('');
        setImage(null);
        if (onTypingStop) onTypingStop();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            if (base64.startsWith('data:image')) {
                setImage(base64);
            } else {
                console.warn('Invalid image data');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (onTypingStart) onTypingStart();

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (onTypingStop) onTypingStop();
        }, 600);
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    return (
        <div className="fixed w-full max-h-20 bottom-0 p-4 border-white/20
                bg-gradient-to-r from-sky-200 via-teal-100 to-emerald-200
 flex items-center gap-3 border-t ">
            {/* 📸 دکمه آپلود عکس */}
            <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-500 hover:text-blue-700 transition"
            >
                <ImageIcon className="w-5 h-5" />
            </button>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
            />

            {/* pic */}
            {image && (
                <div className="relative">
                    <Image
                        width={100}
                        height={100}
                        src={image}
                        alt="preview"
                        className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <button
                        onClick={() => setImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* input */}
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
                <input
                    type="text"
                    value={text}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="پیامت رو بنویس..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800"
                />
            </div>


            <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full text-white transition"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
    );
}
