import { Server } from "ws"
import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Obsługa metody GET dla inicjalizacji
  if (req.method === "GET" && !req.headers.upgrade) {
    console.log("WebSocket initialization endpoint hit via GET")
    res.status(200).json({ success: true, message: "WebSocket server is ready" })
    return
  }

  // Sprawdź, czy to jest żądanie upgrade dla WebSocket
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket") {
    console.log("WebSocket upgrade request detected")

    // @ts-ignore
    if (!res.socket.server.wss) {
      console.log("Initializing WebSocket server")
      // @ts-ignore
      const server = res.socket.server
      const wss = new Server({ noServer: true })

      wss.on("connection", (ws, request) => {
        console.log("New WebSocket connection established")

        // Parsuj URL, aby uzyskać userId
        const url = new URL(request.url || "", "http://localhost")
        const userId = url.searchParams.get("userId")
        console.log(`User connected: ${userId}`)

        // Wyślij potwierdzenie połączenia
        ws.send(
          JSON.stringify({
            type: "connection_established",
            userId,
            timestamp: new Date().toISOString(),
          }),
        )

        // Obsługa wiadomości
        ws.on("message", (message) => {
          try {
            const data = JSON.parse(message.toString())
            console.log("Received message:", data)

            // Obsługa różnych typów wiadomości
            if (data.type === "new_message") {
              // Przekaż wiadomość do wszystkich klientów w tej konwersacji
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === ws.OPEN) {
                  // Sprawdź, czy klient jest w tej samej konwersacji
                  // @ts-ignore
                  if (client.conversationId === data.message.conversationId) {
                    client.send(
                      JSON.stringify({
                        type: "new_message",
                        message: {
                          ...data.message,
                          isMine: false,
                        },
                      }),
                    )
                  }
                }
              })

              // Wyślij potwierdzenie do nadawcy
              ws.send(
                JSON.stringify({
                  type: "message_sent",
                  messageId: data.message.id,
                  timestamp: new Date().toISOString(),
                }),
              )
            } else if (data.type === "join_conversation") {
              // Zapisz ID konwersacji dla tego połączenia
              // @ts-ignore
              ws.conversationId = data.conversationId
              console.log(`User ${data.userId} joined conversation ${data.conversationId}`)

              // Wyślij potwierdzenie dołączenia
              ws.send(
                JSON.stringify({
                  type: "joined_conversation",
                  conversationId: data.conversationId,
                }),
              )
            } else if (data.type === "leave_conversation") {
              // Usuń ID konwersacji dla tego połączenia
              // @ts-ignore
              delete ws.conversationId
              console.log(`User ${data.userId} left conversation ${data.conversationId}`)
            } else if (data.type === "typing") {
              // Przekaż status pisania do wszystkich klientów w tej konwersacji
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === ws.OPEN) {
                  // Sprawdź, czy klient jest w tej samej konwersacji
                  // @ts-ignore
                  if (client.conversationId === data.conversationId) {
                    client.send(
                      JSON.stringify({
                        type: "typing",
                        userId: data.userId,
                        isTyping: data.isTyping,
                      }),
                    )
                  }
                }
              })
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error)
          }
        })

        // Obsługa rozłączenia
        ws.on("close", () => {
          console.log("WebSocket connection closed")
        })

        // Obsługa błędów
        ws.on("error", (error) => {
          console.error("WebSocket error:", error)
        })
      })

      // Obsługa upgrade dla WebSocket
      server.on("upgrade", (request, socket, head) => {
        if (request.url?.startsWith("/api/websocket")) {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request)
          })
        }
      })

      // @ts-ignore
      res.socket.server.wss = wss
    }

    // Zakończ odpowiedź HTTP, ponieważ połączenie zostanie przekształcone w WebSocket
    res.end()
  } else {
    // Dla innych żądań HTTP
    res.status(200).json({ success: true, message: "WebSocket server is ready" })
  }
}
