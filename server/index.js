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

// مسیر فایل فیک دیتابیس
const DATA_FILE = path.join(process.cwd(), "conversations.json");

// دیتای در حافظه
let conversations = {}; // conversationId → [messages]
const onlineUsers = new Map(); // socket.id → user

// --- 📂 لود دیتا از فایل در شروع سرور ---
async function loadConversations() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        conversations = JSON.parse(data || "{}");
        console.log("📂 conversations loaded from file");
    } catch (err) {
        console.log("⚠️ No conversations file found. Creating a new one...");
        conversations = {};
        await saveConversations();
    }
}

// --- 💾 ذخیره دیتا در فایل ---
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

// --- 🌐 WebSocket logic ---
io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    socket.on("login", (user) => {
        onlineUsers.set(socket.id, user);
        io.emit("presence:update", Array.from(onlineUsers.values()));
    });

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
    });

    socket.on("typing:start", ({ user, receiverId }) => {
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === receiverId) {
                io.to(sid).emit("user:typing", { user, typing: true });
            }
        }
    });

    socket.on("typing:stop", ({ user, receiverId }) => {
        for (const [sid, u] of onlineUsers.entries()) {
            if (u.id === receiverId) {
                io.to(sid).emit("user:typing", { user, typing: false });
            }
        }
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(socket.id);
        io.emit("presence:update", Array.from(onlineUsers.values()));
    });
});

// --- 📡 REST API برای گرفتن تاریخچه ---
app.get("/conversations/:id", (req, res) => {
    const convId = req.params.id;
    const msgs = conversations[convId] || [];
    res.json(msgs);
});

// --- Start server ---
const PORT = 3001;
loadConversations().then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
