'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";

interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
}

export default function HomePage() {
    const { login, onlineUsers } = useSocket();
    const router = useRouter();
    const [storedUser, setStoredUser] = useState<User | null>(null);
    const [showChoice, setShowChoice] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        if (stored) {
            const parsed: User = JSON.parse(stored);
            Promise.resolve().then(() => setStoredUser(parsed)); // رفع ارور ESLint
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleContinue = () => {
        if (storedUser) {
            login(storedUser);
            setShowChoice(false);
        }
    };

    const handleNewUser = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!storedUser) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-6 relative">
            <AnimatePresence>
                {showChoice && (
                    <motion.div
                        key="choice"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
                    >
                        <Image
                            width={100}
                            height={100}
                            src={storedUser.avatar}
                            alt={storedUser.name}
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-400"
                        />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            سلام {storedUser.name} 👋
                        </h2>
                        <p className="text-gray-500 mb-6">
                            می‌خوای با حساب فعلیت وارد چت شی یا با حساب جدید؟
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleContinue}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
                            >
                                ادامه با @{storedUser.username}
                            </button>
                            <button
                                onClick={handleNewUser}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
                            >
                                ورود با حساب جدید 🔁
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!showChoice && (
                <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6"
                >
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div className="flex items-center gap-3">
                            <Image
                                height={100}
                                width={100}
                                src={storedUser.avatar}
                                alt={storedUser.name}
                                className="w-12 h-12 rounded-full border-2 border-indigo-400"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-indigo-600">
                                    {storedUser.name} 💬
                                </h1>
                                <p className="text-gray-500">@{storedUser.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleNewUser}
                            className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            خروج
                        </button>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-700 mb-3">
                        👥 کاربران آنلاین ({onlineUsers.length})
                    </h2>
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                        {onlineUsers.map((u) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center gap-3 p-3 rounded-xl shadow-sm ${
                                    u.id === storedUser.id
                                        ? 'bg-indigo-50 border border-indigo-300'
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <Image height={100} width={100} src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-gray-700">{u.name}</p>
                                    <p className="text-sm text-gray-500">@{u.username}</p>
                                </div>
                                {u.id === storedUser.id && (
                                    <span className="ml-auto text-xs text-indigo-500 font-semibold">
                    (شما)
                  </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
