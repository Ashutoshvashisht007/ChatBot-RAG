import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { pushMessage } from "../utils/redisClient";
import { ragQuery } from "../services/rag";

export function initChatSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("chat", async ({ sessionId, query }) => {
      try {
        const sid = sessionId || uuidv4();

        // Save user message in Redis
        await pushMessage(sid, "user", query);

        // Call RAG pipeline
        const { answer, retrieved } = await ragQuery(query, 5);

        // Simulate streaming
        const words = answer.split(" ");
        for (let i = 0; i < words.length; i++) {
          socket.emit("bot-message", { sessionId: sid, chunk: words[i] + " " });
          await new Promise((r) => setTimeout(r, 80));
        }

        // Save bot message
        await pushMessage(sid, "assistant", answer);

        socket.emit("bot-done", { sessionId: sid, answer, retrieved });
      } catch (err) {
        console.error("chat error", err);
        socket.emit("bot-error", { error: (err as any).message });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
}
