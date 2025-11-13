'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketProvider';
import { useUserSession } from './useUserSession';

export function useAuth() {
    const router = useRouter();
    const { login, onlineUsers } = useSocket();
    const { user, clearUser, loading } = useUserSession();

    useEffect(() => {
        if (loading) return; // تا وقتی بررسی تموم نشده صبر کن
        if (!user) {
            router.push('/login');
        } else {
            login(user);
        }
    }, [user, loading, router, login]);

    const logout = () => {
        clearUser();
        router.push('/login');
    };

    return { user, onlineUsers, logout, loading };
}
