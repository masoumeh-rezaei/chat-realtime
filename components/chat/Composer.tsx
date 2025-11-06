'use client';

import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ComposerProps {
    onSend: (text: string) => void;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
}

export default function Composer({ onSend, onTypingStart, onTypingStop }: ComposerProps) {
    const [text, setText] = useState<string>('');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');
        if (onTypingStop) onTypingStop();
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
        <div className="p-4 bg-gradient-to-r from-green-200 to-blue-200 flex items-center gap-3 border-t border-white/20 backdrop-blur-sm">
            <div className="flex-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-4 py-2 flex items-center shadow-sm">
                <input
                    type="text"
                    value={text}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                    placeholder="پیامت رو بنویس..."
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
                />
            </div>

            <button
                onClick={handleSend}
                className=" text-blue-600  transition-all p-3 rounded-full"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
    );
}
