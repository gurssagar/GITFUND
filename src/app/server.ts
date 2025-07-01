import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

interface ChatMessage {
  text: string;
  timestamp: string;
  to: string;
  from: string;
}

interface UserConnection {
  socket: Socket;
  username: string;
  connectionTime: number;
}

const app = express();

// Add CORS middleware before other routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const port = parseInt(process.env.PORT || "4000", 10);
const httpServer = createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  pingInterval: 25000, // default is 25000ms
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

// Store connected users with their active connections
const activeConnections = new Map<string, UserConnection>();

// Track if the users list has changed since last broadcast
let usersListChanged = false;

// Function to broadcast the updated users list to all connected clients
function broadcastUsersList() {
  // Only broadcast if there are actual changes or if it's explicitly requested
  if (!usersListChanged && activeConnections.size > 0) {
    return;
  }

  const usersList = Array.from(activeConnections.keys());
  console.log(`[BroadcastUsersList] Sending updated users list: ${usersList}`);
  io.emit("usersList", { users: usersList });

  // Reset the changed flag
  usersListChanged = false;
}

// Set up periodic broadcasting of users list every 30 seconds, but only if there were changes
setInterval(broadcastUsersList, 30000);

// Add middleware for Socket.io authentication
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("Invalid username"));
  }

  // Attach the username to the socket for later use
  socket.data.username = username;
  next();
});

io.on("connection", (socket: Socket) => {
  console.log(`[Connection] Client connected: ${socket.id}`);

  // Get the username from socket data (set in middleware)
  const username = socket.data.username;

  // If username exists, handle the connection
  if (username) {
    console.log(
      `[Auth] User ${username} connected with SocketID: ${socket.id}`,
    );

    // Check if user already exists in activeConnections
    if (activeConnections.has(username)) {
      const existingConnection = activeConnections.get(username);

      if (existingConnection) {
        // If this is a reconnection from the same user
        console.log(
          `[Reconnection] User ${username} reconnecting. Old SocketID: ${existingConnection.socket.id}, New SocketID: ${socket.id}`,
        );

        // Clean up the old socket
        try {
          existingConnection.socket.disconnect(true);
        } catch (err) {
          console.log(
            `[DisconnectError] Error disconnecting old socket: ${err}`,
          );
        }
      }
    } else {
      // Only mark as changed if it's a new user, not a reconnection
      usersListChanged = true;
    }

    // Store the new connection
    activeConnections.set(username, {
      socket,
      username,
      connectionTime: Date.now(),
    });

    console.log(
      `[AuthSuccess] User: ${username} added with SocketID: ${socket.id}. Active connections: ${Array.from(activeConnections.keys())}`,
    );

    // Send authentication confirmation to the connected client
    socket.emit("authenticated", { username });

    // Send the current user list to the newly connected client
    socket.emit("usersList", { users: Array.from(activeConnections.keys()) });

    // Broadcast updated list if a new user joined (not just reconnected)
    if (usersListChanged) {
      broadcastUsersList();
    }
  }

  socket.on("message", (msg) => {
    if (!username) {
      socket.emit("error", "Not authenticated");
      return;
    }
    console.log(`[BroadcastMessage] From: ${username}, SocketID: ${socket.id}`);
    socket.broadcast.emit("message", msg);
  });

  socket.on("hello", (arg) => {
    console.log(`[Hello] SocketID: ${socket.id}, Arg: ${JSON.stringify(arg)}`);
    socket.emit("hello_response", "Server received your hello");
  });

  // Handle requests for the current users list
  socket.on("getUsersList", () => {
    console.log(`[GetUsersList] Request from SocketID: ${socket.id}`);
    socket.emit("usersList", { users: Array.from(activeConnections.keys()) });
  });

  // Private message handler with validation
  socket.on("privateMessage", (msg: ChatMessage, callback) => {
    if (!username) {
      // Use callback for error
      if (callback) callback({ error: "Not authenticated" });
      return;
    }

    // Add missing properties if not provided by client
    if (!msg.from) msg.from = username;
    if (!msg.timestamp) msg.timestamp = new Date().toISOString();

    // Rest of validation...
    if (msg.from !== username) {
      if (callback) callback({ error: "Unauthorized message attempt" });
      return;
    }

    const recipient = activeConnections.get(msg.to);
    if (!recipient) {
      if (callback) callback({ error: "Recipient not available" });
      return;
    }

    if (shouldUsersCommunicate(msg.from, msg.to)) {
      const timestampedMsg = {
        ...msg,
        serverTimestamp: new Date().toISOString(),
      };
      recipient.socket.emit("privateMessage", timestampedMsg);

      // Use callback for success
      if (callback) callback({ messageId: msg.timestamp });
    } else {
      if (callback) callback({ error: "Communication not allowed" });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Disconnect] SocketID: ${socket.id}, Reason: ${reason}`);
    let disconnectedUser: string | null = null;

    // Find user by socket.id to remove from activeConnections
    activeConnections.forEach((value, key) => {
      if (value.socket.id === socket.id) {
        disconnectedUser = key;
      }
    });

    if (disconnectedUser) {
      // Keep the connection for a short time to allow for page refreshes
      setTimeout(() => {
        // Check if the user hasn't reconnected in the meantime
        const currentConnection = activeConnections.get(
          disconnectedUser as string,
        );

        if (currentConnection && currentConnection.socket.id === socket.id) {
          usersListChanged = true;

          console.log(
            `[UserRemoved] User: ${disconnectedUser} (SocketID: ${socket.id}) removed after timeout. Active connections: ${Array.from(activeConnections.keys())}`,
          );

          // Broadcast the updated users list after removing the user
          broadcastUsersList();
        }
      }, 10000); // 10 seconds grace period for reconnection

      console.log(
        `[UserDisconnectTimeout] User: ${disconnectedUser} (SocketID: ${socket.id}) will be removed in 10 seconds if no reconnection occurs.`,
      );
    } else {
      console.log(
        `[DisconnectNoUser] SocketID: ${socket.id} disconnected, but was not found in activeConnections (might not have authenticated).`,
      );
    }
  });
});

// Helper function to validate communication permissions
function shouldUsersCommunicate(user1: string, user2: string): boolean {
  // Implement your business logic here
  // Example: Check if users are friends, in same group, etc.
  return true; // For now allowing all communications
}

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

console.log(activeConnections, "heyy Active");

export default app;
