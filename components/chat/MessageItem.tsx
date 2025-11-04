'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

interface MessageItemProps {
    text: string;
    time: string;
    isOwn: boolean;
}

export default function MessageItem({ text, time, isOwn }: MessageItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'flex w-full mb-2',
                isOwn ? 'justify-end' : 'justify-start'
            )}
        >
            <div
                className={clsx(
                    'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                    isOwn
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                )}
            >
                <p>{text}</p>
                <span
                    className={clsx(
                        'text-xs mt-1 block text-right',
                        isOwn ? 'text-indigo-100' : 'text-gray-500'
                    )}
                >
          {time}
        </span>
            </div>
        </motion.div>
    );
}
