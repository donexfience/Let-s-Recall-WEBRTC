import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000, 
});

interface Room {
  participants: Set<string>;
  createdAt: number;
}

const rooms: { [roomId: string]: Room } = {};

// Cleanup inactive rooms periodically
const cleanupInactiveRooms = () => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; 

  Object.entries(rooms).forEach(([roomId, room]) => {
    if (now - room.createdAt > maxAge && room.participants.size === 0) {
      delete rooms[roomId];
      console.log(`Cleaned up inactive room: ${roomId}`);
    }
  });
};

setInterval(cleanupInactiveRooms, 60 * 60 * 1000); // cleanup every hour

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join-room", (roomId: string) => {
    try {
      // Create room if it doesn't exist
      if (!rooms[roomId]) {
        rooms[roomId] = {
          participants: new Set(),
          createdAt: Date.now(),
        };
      }

      // Add participant to room
      rooms[roomId].participants.add(socket.id);
      socket.join(roomId);

      // Emit current participants to the joining user
      socket.emit("room-participants", Array.from(rooms[roomId].participants));

      // Notify others in the room
      socket.to(roomId).emit("user-connected", socket.id);

      console.log(`User ${socket.id} joined room ${roomId}`);
      console.log(
        `Room ${roomId} participants:`,
        Array.from(rooms[roomId].participants)
      );
    } catch (error) {
      console.error("Error in join-room:", error);
      socket.emit("error", "Failed to join room");
    }
  });

  socket.on(
    "offer",
    (data: { to: string; offer: RTCSessionDescriptionInit }) => {
      try {
        socket.to(data.to).emit("offer", {
          from: socket.id,
          offer: data.offer,
        });
      } catch (error) {
        console.error("Error in offer:", error);
      }
    }
  );

  socket.on(
    "answer",
    (data: { to: string; answer: RTCSessionDescriptionInit }) => {
      try {
        socket.to(data.to).emit("answer", {
          from: socket.id,
          answer: data.answer,
        });
      } catch (error) {
        console.error("Error in answer:", error);
      }
    }
  );

  socket.on(
    "ice-candidate",
    (data: { to: string; candidate: RTCIceCandidateInit }) => {
      try {
        socket.to(data.to).emit("ice-candidate", {
          from: socket.id,
          candidate: data.candidate,
        });
        console.log("ICE candidate forwarded from", socket.id, "to", data.to);
      } catch (error) {
        console.error("Error in ice-candidate:", error);
      }
    }
  );

  const handleDisconnect = () => {
    try {
      Object.entries(rooms).forEach(([roomId, room]) => {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id);
          socket.to(roomId).emit("user-disconnected", socket.id);

          if (room.participants.size === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} removed - no participants left`);
          }
        }
      });

      console.log(`User disconnected: ${socket.id}`);
    } catch (error) {
      console.error("Error in disconnect handler:", error);
    }
  };

  socket.on("disconnect", handleDisconnect);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    connections: io.engine.clientsCount,
    rooms: Object.keys(rooms).length,
  });
});

const PORT = process.env.PORT || 9005;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
