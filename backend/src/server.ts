import http from "http";
import app from "./app";
import { initChatSocket } from "./sockets/chat.socket";

const PORT = Number(process.env.PORT || 5000);
const server = http.createServer(app);

// attach socket logic
initChatSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// // server.ts
// import http from 'http';
// import { Server as IOServer } from 'socket.io';
// import app from './app';
// import { pushMessage, getHistory } from './utils/redisClient';
// import { ragQuery } from './services/rag';

// const PORT = Number(process.env.PORT || 4000);
// const server = http.createServer(app);
// const io = new IOServer(server, {
//   cors: { origin: '*' }
// });

// /**
//  * Socket events:
//  * - client emits 'chat' with { sessionId?, query }
//  * - server emits 'reply' events with { sessionId, chunk? } or final { sessionId, done: true, answer }
//  */
// io.on('connection', (socket) => {
//   console.log('socket connected', socket.id);

//   socket.on('chat', async (data: { sessionId?: string, query: string }) => {
//     const sessionId = data.sessionId || undefined;
//     const query = data.query;
//     if (!query) {
//       socket.emit('error', { error: 'query required' });
//       return;
//     }

//     // store user message
//     const sid = sessionId || require('uuid').v4();
//     await pushMessage(sid, 'user', query);
//     socket.emit('ack', { sessionId: sid });

//     // run rag pipeline
//     try {
//       const { answer, retrieved } = await ragQuery(query, 5);

//       // push assistant message
//       await pushMessage(sid, 'assistant', answer);

//       // send final reply
//       socket.emit('reply', { sessionId: sid, answer, retrieved });
//     } catch (err) {
//       console.error('socket rag error', err);
//       socket.emit('error', { error: (err as any).message || 'internal' });
//     }
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });
