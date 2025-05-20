import { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest, NextApiResponse } from "next"

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Socket.IO endpoint hit:", req.method, req.url)

  // Obsługa metody GET dla inicjalizacji
  if (req.method === "GET") {
    console.log("Socket.IO initialization endpoint hit via GET")
    res.setHeader("Content-Type", "application/json")
    res.status(200).json({ success: true, message: "Socket.IO server is ready" })
    return
  }

  // Sprawdź, czy to jest żądanie upgrade dla WebSocket
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket") {
    console.log("WebSocket upgrade request detected")

    if (!res.socket.server.io) {
      console.log("*First use, starting Socket.IO server...")

      // @ts-ignore
      const httpServer = res.socket.server

      const io = new SocketIOServer(httpServer, {
        path: "/api/socketio",
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      })

      // Przechowujemy połączenia dla każdego użytkownika
      const userConnections = new Map<string, Set<string>>()
      // Przechowujemy połączenia dla każdej konwersacji
      const conversationConnections = new Map<string, Set<string>>()

      io.on("connection", (socket) => {
        console.log("New Socket.IO connection:", socket.id)

        // Obsługa dołączania użytkownika
        socket.on("user_connect", (userId) => {
          console.log(`User ${userId} connected with socket ${socket.id}`)

          // Zapisz socket ID dla użytkownika
          if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set())
          }
          userConnections.get(userId)?.add(socket.id)

          // Powiadom innych o statusie online
          socket.broadcast.emit("user_status", { userId, isOnline: true })

          // Wyślij potwierdzenie połączenia
          socket.emit("connection_established", {
            userId,
            timestamp: new Date().toISOString(),
          })
        })

        // Obsługa dołączania do konwersacji
        socket.on("join_conversation", ({ userId, conversationId }) => {
          console.log(`User ${userId} joining conversation ${conversationId}`)

          // Dołącz do pokoju konwersacji
          socket.join(`conversation:${conversationId}`)

          // Zapisz socket ID dla konwersacji
          if (!conversationConnections.has(conversationId)) {
            conversationConnections.set(conversationId, new Set())
          }
          conversationConnections.get(conversationId)?.add(socket.id)

          // Powiadom o dołączeniu
          socket.emit("joined_conversation", { conversationId })
        })

        // Obsługa opuszczania konwersacji
        socket.on("leave_conversation", ({ userId, conversationId }) => {
          console.log(`User ${userId} leaving conversation ${conversationId}`)

          // Opuść pokój konwersacji
          socket.leave(`conversation:${conversationId}`)

          // Usuń socket ID z konwersacji
          conversationConnections.get(conversationId)?.delete(socket.id)
          if (conversationConnections.get(conversationId)?.size === 0) {
            conversationConnections.delete(conversationId)
          }
        })

        // Obsługa nowych wiadomości
        socket.on("new_message", ({ message, userId }) => {
          console.log(`New message in conversation ${message.conversationId} from user ${userId}`)

          // Wyślij wiadomość do wszystkich w konwersacji
          socket.to(`conversation:${message.conversationId}`).emit("new_message", {
            ...message,
            isMine: false,
          })

          // Wyślij potwierdzenie do nadawcy
          socket.emit("message_sent", {
            messageId: message.id,
            timestamp: new Date().toISOString(),
          })
        })

        // Obsługa pisania
        socket.on("typing", ({ userId, conversationId, isTyping }) => {
          console.log(`User ${userId} typing status in conversation ${conversationId}: ${isTyping}`)

          // Wyślij status pisania do wszystkich w konwersacji oprócz nadawcy
          socket.to(`conversation:${conversationId}`).emit("typing", {
            userId,
            isTyping,
          })
        })

        // Obsługa rozłączenia
        socket.on("disconnect", () => {
          console.log(`Socket ${socket.id} disconnected`)

          // Znajdź użytkownika dla tego socketu
          let disconnectedUserId: string | null = null

          userConnections.forEach((socketIds, userId) => {
            if (socketIds.has(socket.id)) {
              socketIds.delete(socket.id)

              // Jeśli to był ostatni socket użytkownika, oznacz go jako offline
              if (socketIds.size === 0) {
                disconnectedUserId = userId
                userConnections.delete(userId)
              }
            }
          })

          // Powiadom innych o statusie offline
          if (disconnectedUserId) {
            console.log(`User ${disconnectedUserId} is now offline`)
            socket.broadcast.emit("user_status", {
              userId: disconnectedUserId,
              isOnline: false,
            })
          }

          // Usuń socket z konwersacji
          conversationConnections.forEach((socketIds, conversationId) => {
            if (socketIds.has(socket.id)) {
              socketIds.delete(socket.id)
              if (socketIds.size === 0) {
                conversationConnections.delete(conversationId)
              }
            }
          })
        })
      })

      // @ts-ignore
      res.socket.server.io = io
    } else {
      console.log("Socket.IO server already running")
    }
  } else {
    console.log("Non-WebSocket request to Socket.IO endpoint")
    res.setHeader("Content-Type", "application/json")
    res.status(200).json({ success: true, message: "Socket.IO server is ready" })
  }

  res.end()
}

export default ioHandler
