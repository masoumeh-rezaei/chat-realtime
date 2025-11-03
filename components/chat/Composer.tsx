'use client';

import { Send } from 'lucide-react';
import {useState, useRef, useEffect} from 'react';

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
        if (onTypingStop) onTypingStop(); // وقتی پیام فرستاده شد، تایپینگ متوقف شود
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);

        // اطلاع بده که شروع به تایپ کرده
        if (onTypingStart) onTypingStart();

        // اگه مدتی تایپ نکرد، stop بفرست
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
        <div className="flex items-center gap-2 p-3 border-t bg-white">
            <input
                type="text"
                value={text}
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                }}
                placeholder="پیامت رو بنویس..."
                className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
                onClick={handleSend}
                className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl text-white transition"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
    );
}
