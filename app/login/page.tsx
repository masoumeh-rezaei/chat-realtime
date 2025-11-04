'use client';
import React, { useState } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { useRouter } from 'next/navigation';
import { faker } from '@faker-js/faker';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { login } = useSocket();
    const router = useRouter();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = faker.string.alphanumeric(8);
        const user = {
            id,
            name: name || 'کاربر',
            username: username || id,
            avatar: `https://robohash.org/${id}.png`
        };
        sessionStorage.setItem('user', JSON.stringify(user));

        login(user);
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400">
            <motion.form
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 rounded-3xl shadow-2xl w-96 flex flex-col gap-5"
                onSubmit={handleSubmit}
            >
                <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
                    ورود به چت 💬
                </h1>
                <p className="text-center text-gray-500 text-sm mb-4">
                    برای شروع یک نام و یوزرنیم انتخاب کن
                </p>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام کامل"
                    className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="یوزرنیم"
                    className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-xl font-semibold"
                >
                    ورود 🚀
                </button>
            </motion.form>
        </div>
    );
}
