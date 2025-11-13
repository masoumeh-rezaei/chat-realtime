import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // ✅ برای ارسال Base64 تصویر

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const DATA_FILE = path.join(process.cwd(), 'conversations.json');
let conversations = {};
const onlineUsers = new Map();

async function loadConversations() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        conversations = JSON.parse(data || '{}');
        console.log('📂 Conversations loaded');
    } catch {
        conversations = {};
        await saveConversations();
        console.log('⚠️ No file found, created new conversations.json');
    }
}

let writing = false;
async function saveConversations() {
    if (writing) return;
    writing = true;
    setTimeout(async () => {
        try {
            await fs.writeFile(DATA_FILE, JSON.stringify(conversations, null, 2));
        } finally {
            writing = false;
        }
    }, 100);
}

io.on('connection', (socket) => {
    console.log('🟢 Connected:', socket.id);

    socket.on('login', (user) => {
        onlineUsers.set(socket.id, user);
        io.emit('presence:update', Array.from(onlineUsers.values()));
    });

    // ارسال پیام (متن یا تصویر)
    socket.on('message:send', (msg) => {
        const sender = onlineUsers.get(socket.id); // کاربر فرستنده
        const messageWithSender = { ...msg, sender };

        const { conversationId } = msg;
        if (!conversations[conversationId]) conversations[conversationId] = [];
        conversations[conversationId].push(messageWithSender);
        saveConversations();

        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === msg.receiverId || u.id === msg.senderId) {
                io.to(sid).emit('message:recv', messageWithSender);
            }
        }
    });


    // واکنش به پیام
    socket.on('message:react', ({ messageId, emoji, userId, username }) => {
        for (const convId in conversations) {
            const msg = conversations[convId].find((m) => m.id === messageId);
            if (msg) {
                if (!msg.reactions) msg.reactions = {};

                // حذف ری‌اکشن قبلی این کاربر
                for (const key in msg.reactions) {
                    msg.reactions[key] = msg.reactions[key].filter((r) => r.userId !== userId);
                    if (msg.reactions[key].length === 0) delete msg.reactions[key];
                }

                // اضافه کردن آخرین ری‌اکشن
                if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
                msg.reactions[emoji].push({ userId, username });

                saveConversations();

                io.emit('message:reaction', { messageId, emoji, userId, username });
                break;
            }
        }
    });


    socket.on('message:read', ({ messageIds, userId }) => {
        for (const convId in conversations) {
            conversations[convId] = conversations[convId].map((m) =>
                messageIds.includes(m.id) ? { ...m, read: true } : m
            );
        }
        saveConversations();

        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id !== userId) io.to(sid).emit('message:read:update', messageIds);
        }
    });

    socket.on('typing:start', ({ user, receiverId }) => {
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === receiverId) io.to(sid).emit('user:typing', { user, typing: true });
        }
    });

    socket.on('typing:stop', ({ user, receiverId }) => {
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === receiverId) io.to(sid).emit('user:typing', { user, typing: false });
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('presence:update', Array.from(onlineUsers.values()));
    });
});

app.get('/conversations/:id', (req, res) => {
    const convId = req.params.id;
    res.json(conversations[convId] || []);
});

const PORT = 3001;
loadConversations().then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
