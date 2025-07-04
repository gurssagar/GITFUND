import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

interface User {
  userId: string;
  username: string;
  socketId: string;
}

// Store connected users
const users: User[] = [];

// Find a user by their username
const findUserByUsername = (username: string): User | undefined => {
  return users.find((user) => user.username === username);
};

// Find a user by their socket ID
const findUserBySocketId = (socketId: string): User | undefined => {
  return users.find((user) => user.socketId === socketId);
};

// Remove a user when they disconnect
const removeUser = (socketId: string): void => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    users.splice(index, 1);
  }
};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    connectionStateRecovery: {
      // Enable socket state recovery
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    },
  });

  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("Invalid username"));
    }

    // Check if user is already connected
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return next(new Error("User already connected"));
    }

    // Attach username to socket
    socket.data.username = username;
    next();
  });

  io.on("connection", (socket) => {
    const username = socket.data.username;

    // Create a new user
    const newUser = {
      userId: socket.id, // Using socket.id as userId for simplicity
      username,
      socketId: socket.id,
    };

    // Add to users array
    users.push(newUser);

    // Send authentication confirmation
    socket.emit("authenticated", { username });

    // Broadcast to all clients that user list has changed
    io.emit("usersUpdated");

    console.log(`User ${username} connected. Total users: ${users.length}`);

    // Handle getUsers request
    socket.on("getUsers", (callback) => {
      try {
        // Map users to a simplified format with online status
        const usersList = users.map((user) => ({
          username: user.username,
          isOnline: true,
          id: user.userId,
        }));

        // Send the list via callback
        callback({ users: usersList });
      } catch (error) {
        console.error("Error getting users:", error);
        callback({ error: "Failed to get users" });
      }
    });

    // Handle private messages
    socket.on("privateMessage", async (data, callback) => {
      try {
        const { to, text } = data;
        const from = socket.data.username;

        // Find recipient
        const recipient = findUserByUsername(to);

        if (!recipient) {
          return callback({ error: "Recipient not available" });
        }

        // Create message with timestamp
        const timestamp = new Date().toISOString();
        const messageId = `msg_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const message = {
          from,
          to,
          text,
          timestamp,
          id: messageId,
        };

        // Send to recipient
        io.to(recipient.socketId).emit("privateMessage", message);

        // Acknowledge successful delivery
        callback({ messageId });

        // Notify sender that message was delivered
        socket.emit("messageDelivered", { to, timestamp });
      } catch (error) {
        console.error("Error sending private message:", error);
        callback({ error: "Failed to send message" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const user = findUserBySocketId(socket.id);
      if (user) {
        console.log(`User ${user.username} disconnected`);
        removeUser(socket.id);

        // Broadcast to all clients that user list has changed
        io.emit("usersUpdated");
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
