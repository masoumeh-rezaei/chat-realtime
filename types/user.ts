// 📁 types/user.ts

export interface ChatUser {
    id: string;
    name: string;
    username?: string;
    avatar: string;
}
export interface Reaction {
    userId: string;
    username: string;
}


export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string; // ✅ اضافه کن
    text: string;
    image?: string;
    time: string;
    conversationId: string;
    delivered?: boolean;
    read?: boolean;
    sender?: ChatUser;
    reactions?: {
        [emoji: string]: { userId: string; username: string }[];
    };


}

export interface TypingEvent {
    user: ChatUser;
    typing: boolean;
}

export interface UnreadCount {
    [userId: string]: number;
}

export interface Conversation {
    id: string;
    participants: ChatUser[];
    messages: ChatMessage[];
    lastUpdated?: string;
}
