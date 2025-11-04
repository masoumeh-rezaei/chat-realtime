'use client';

import React from 'react';
import { motion } from 'framer-motion';

import UserCard from './UserCard';

interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
}

export default function OnlineUsersList({
                                            users,
                                            currentUser,
                                        }: {
    users: User[];
    currentUser: User;
}) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
                👥 کاربران آنلاین ({users.length})
            </h2>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {users.map((u) => (
                    <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <UserCard user={u} isCurrent={u.id === currentUser.id} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
