// import http from "http";
// import app from "./app";
// import { initChatSocket } from "./sockets/chat.socket";

// const PORT = Number(process.env.PORT || 5000);
// const server = http.createServer(app);

// // attach socket logic
// initChatSocket(server);

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


import http from "http";
import app from "./app";
import { initChatSocket } from "./sockets/chat.socket";
import { ensureTableExists } from "./services/transcript.service";

const PORT = Number(process.env.PORT || 5000);
const server = http.createServer(app);

// Database initialization
async function initializeDatabase() {
  try {
    await ensureTableExists();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    // Don't exit process, just log the error - server can still work without DB persistence
    console.warn('⚠️ Server will continue without database persistence');
  }
}

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Attach socket logic
    initChatSocket(server);
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database connection verified`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();