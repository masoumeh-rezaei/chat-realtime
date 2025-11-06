'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { ChatUser } from '@/types/user';

interface ChatHeaderProps {
    me: ChatUser;
}

export default function ChatHeader({ me }: ChatHeaderProps) {
    const router = useRouter();

    return (
        <div className="
            flex items-center justify-between
             backdrop-blur-md
             rounded-2xl  py-3
            border border-white/30
            sticky top-0 z-10 mt-0! pt-0!
        ">


            {/* 🔙 دکمه برگشت */}
            <button
                onClick={() => router.push('/')}
                className="
                    flex items-center gap-2 text-gray-700
                    hover:text-indigo-600 hover:scale-105
                    transition-all duration-200
                "
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">بازگشت</span>
            </button>
            {/* 👤 اطلاعات کاربر */}
            <div className="flex items-center gap-3 ">

                <div className="text-right">
                    <h1 className="text-lg sm:text-lg font-semibold text-indigo-700 leading-tight text-left">
                          ! سلام {me.name} جان
                    </h1>
                    <p className="text-sm sm:text-sm text-gray-500">@{me.username}</p>
                </div>
                <Image
                    src={me.avatar || `https://robohash.org/${me.id}.png`}
                    alt={me.name}
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-indigo-400 shadow-md"
                />

            </div>
        </div>
    );
}
