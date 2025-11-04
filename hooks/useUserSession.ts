'use client';
import { useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
}

export function useUserSession() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('user');
            if (stored) {
                setUser(JSON.parse(stored));
            }
            setLoading(false); // بعد از بررسی، لودینگ تموم میشه
        }
    }, []);

    const saveUser = (u: User) => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('user', JSON.stringify(u));
        }
        setUser(u);
    };

    const clearUser = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('user');
        }
        setUser(null);
    };

    return { user, saveUser, clearUser, loading };
}
