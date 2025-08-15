import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { captureRejectionSymbol } from "events";

const port = 3000;

// 🏢 "Build the shop" — create the Express app (the tool/rulebook for handling requests).
// This defines how to respond to HTTP requests, but it’s not a server yet.
const app = express();

// "Hire the guard" — create the real HTTP server that stands at the door for all guests.
// This single guard can handle normal guests (HTTP) using the rulebook (app)
// and special guests (WebSocket) using the walkie-talkie (Socket.IO).
const httpServer = http.createServer(app);

// "Give the guard a walkie-talkie" - attach Socket.IO to the HTTP server.
// This equips the guard to communicate in real time (two-way) with special guests (WebSocket clients),
// while still serving normal guests via HTTP.
// `io` is the Socket.IO server instance that manages and coordinates WebSocket connections.
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🎧 Guard using the walkie-talkie — handles special guests (WebSocket/Socket.IO clients).
// Built-in 'connection' event — fires when a client successfully connects

// Middleware for authenticating/authorizing socket connections
// Runs BEFORE the 'connection' event is triggered
// Here: checks if 'user' is truthy before allowing the socket to connect
// If `next()` is not called, the connection will be rejected
// const user = false; // Hardcoding user to false
// io.use((socket, next) => {
//   if (user) {
//     next(); // allow connection
//   }
// });

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  socket.on("message", ({ room, message }) => {
    console.log(room, message);
    io.to(room).emit("receive-message", message); // io.to == socket.to
  });

  // Listening for the "join-room" event triggered from the frontend

  socket.on("join-room", (room) => {
    // Add this specific client's connection (socket) into the given room.
    // This allows sending messages only to members of that room.
    socket.join(room);

    console.log(`User ${socket.id} has joined room: ${room}`);
  });
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
); // using cors middleware before hitting any API

// 🛍 Guard using the rulebook — handles normal guests (standard HTTP requests).
app.get("/", (req, res) => {
  res.send("Hello world !");
});

// "Open the shop doors" — start accepting guests.
// The single guard (httpServer) is now on duty, ready to handle both HTTP guests (via the rulebook)
// and WebSocket guests (via the walkie-talkie).
httpServer.listen(port, () => {
  console.log(`server is running at port ${port}`);
});

// httpServer → one guard handling everyone.
// app → the guard’s rulebook for normal guests (HTTP).
// io → the guard’s walkie-talkie system for special guests (WebSocket).
