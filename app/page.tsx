'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import OnlineUsersList from '@/components/OnlineUsersList';

export default function HomePage() {
    const { user, onlineUsers, logout, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                در حال بارگذاری...
            </div>
        );
    }

    if (!user) return null; // چون useAuth خودش redirect می‌کنه

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6"
            >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Image
                            width={100}
                            height={100}
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full border-2 border-indigo-400"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-indigo-600">{user.name} 💬</h1>
                            <p className="text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                    <Button onClick={logout} variant="danger">
                        خروج
                    </Button>
                </div>

                <OnlineUsersList users={onlineUsers} currentUser={user} />

                <div className="flex justify-center mt-8">
                    <Button onClick={() => router.push('/chat')} variant="primary" size="lg">
                        شروع چت 💬
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
