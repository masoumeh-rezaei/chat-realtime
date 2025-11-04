'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { faker } from '@faker-js/faker';

interface LoginFormProps {
    onSubmit: (user: {
        id: string;
        name: string;
        username: string;
        avatar: string;
    }) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = faker.string.alphanumeric(8);
        const user = {
            id,
            name: name.trim() || 'کاربر ناشناس',
            username: username.trim() || id,
            avatar: `https://robohash.org/${id}.png`,
        };
        onSubmit(user);
    };

    return (
        <motion.form
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col gap-5"
        >
            <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
                ورود به چت 💬
            </h1>

            <p className="text-center text-gray-500 text-sm mb-4">
                نام و یوزرنیم دلخواهت رو وارد کن 👇
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
                className="bg-indigo-600 hover:bg-indigo-700 transition-all text-white py-3 rounded-xl font-semibold shadow-sm"
            >
                ورود 🚀
            </button>
        </motion.form>
    );
}
