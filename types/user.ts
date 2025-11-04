// 📁 types/user.ts

export interface ChatUser {
    id: string;
    name: string;
    username: string;
    avatar: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string; // ✅ اضافه کن
    text: string;
    time: string;
    conversationId: string;
    delivered?: boolean;
    read?: boolean;
    sender?: ChatUser;
}
