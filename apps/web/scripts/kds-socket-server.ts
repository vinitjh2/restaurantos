import { createServer } from "http";
import { Server } from "socket.io";
import { kdsEmitter } from "../src/lib/server/kds-events";
import { prisma } from "../src/lib/server/prisma";

const PORT = process.env.KDS_SOCKET_PORT ? parseInt(process.env.KDS_SOCKET_PORT) : 3001;

const httpServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "KDS Socket.IO Server Running", port: PORT }));
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

console.log(`Starting RestaurantOS KDS Socket.IO Gateway on port ${PORT}...`);

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Kitchen terminal connected: ${socket.id}`);

  socket.on("join_station", (station) => {
    socket.join(station);
    console.log(`[Socket.IO] Terminal ${socket.id} subscribed to station: ${station}`);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Kitchen terminal disconnected: ${socket.id}`);
  });
});

// Bridge internal event emitter to Socket.IO clients
kdsEmitter.on("kds_event", (payload) => {
  console.log(`[Socket.IO Broadcast] Emitting event ${payload.type} for KOT ${payload.kot?.kotNumber}`);
  io.emit("kds_event", payload);
  if (payload.kot?.station) {
    io.to(payload.kot.station).emit("kds_station_event", payload);
  }
});

httpServer.listen(PORT, () => {
  console.log(`[Socket.IO Ready] Real-time KDS Gateway active at http://localhost:${PORT}`);
});
