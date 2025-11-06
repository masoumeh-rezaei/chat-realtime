import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const DATA_FILE = path.join(process.cwd(), "conversations.json");

// دیتای موقتی در حافظه
let conversations = {}; // conversationId → [messages]
const onlineUsers = new Map(); // socket.id → user

// 📂 بارگذاری گفتگوها از فایل
async function loadConversations() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        conversations = JSON.parse(data || "{}");
        console.log("📂 Conversations loaded from file");
    } catch {
        conversations = {};
        await saveConversations();
        console.log("⚠️ No file found, created new conversations.json");
    }
}

// 💾 ذخیره در فایل
let writing = false;
async function saveConversations() {
    if (writing) return;
    writing = true;
    setTimeout(async () => {
        try {
            await fs.writeFile(DATA_FILE, JSON.stringify(conversations, null, 2));
        } catch (err) {
            console.error("❌ Error saving conversations:", err);
        } finally {
            writing = false;
        }
    }, 100);
}

// 🌐 WebSocket logic
io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    socket.on("login", (user) => {
        onlineUsers.set(socket.id, user);
        io.emit("presence:update", Array.from(onlineUsers.values()));
    });

    // ✉️ ارسال پیام
    socket.on("message:send", (msg) => {
        const { conversationId } = msg;

        if (!conversations[conversationId]) conversations[conversationId] = [];
        conversations[conversationId].push(msg);
        saveConversations();

        // ارسال پیام به دو طرف
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === msg.receiverId || u.id === msg.senderId) {
                io.to(sid).emit("message:recv", msg);
            }
        }

        // 📬 اطلاع به فرستنده که پیام تحویل داده شد
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === msg.senderId) {
                io.to(sid).emit("message:delivered", msg.id);
            }
        }
    });

    // 👁‍🗨 وقتی پیام‌ها خوانده شدند
    socket.on("message:read", ({ messageIds, userId }) => {
        // پیام‌ها را در دیتابیس به حالت خوانده تغییر بده
        for (const convId in conversations) {
            conversations[convId] = conversations[convId].map((m) =>
                messageIds.includes(m.id) ? { ...m, read: true } : m
            );
        }
        saveConversations();

        // اطلاع به تمام فرستنده‌ها
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id !== userId) {
                io.to(sid).emit("message:read:update", messageIds);
            }
        }
    });

    // ✍️ تایپینگ
    socket.on("typing:start", ({ user, receiverId }) => {
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === receiverId) io.to(sid).emit("user:typing", { user, typing: true });
        }
    });

    socket.on("typing:stop", ({ user, receiverId }) => {
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === receiverId) io.to(sid).emit("user:typing", { user, typing: false });
        }
    });

    // 🔴 قطع اتصال
    socket.on("disconnect", () => {
        onlineUsers.delete(socket.id);
        io.emit("presence:update", Array.from(onlineUsers.values()));
    });

});

// 📡 API برای گرفتن تاریخچه
app.get("/conversations/:id", (req, res) => {
    const convId = req.params.id;
    res.json(conversations[convId] || []);
});

// 🚀 Start server
const PORT = 3001;
loadConversations().then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
