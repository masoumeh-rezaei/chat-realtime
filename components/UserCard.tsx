'use client';

import React from 'react';
import Image from 'next/image';

interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
}

export default function UserCard({ user, isCurrent }: { user: User; isCurrent: boolean }) {
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-xl shadow-sm transition ${
                isCurrent ? 'bg-indigo-50 border border-indigo-300' : 'bg-white hover:bg-gray-50'
            }`}
        >
            <Image
                width={100}
                height={100}
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full"
            />
            <div>
                <p className="font-semibold text-gray-700">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
            {isCurrent && (
                <span className="ml-auto text-xs text-indigo-500 font-semibold">(شما)</span>
            )}
        </div>
    );
}
