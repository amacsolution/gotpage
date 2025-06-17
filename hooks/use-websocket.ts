"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type WebSocketMessage = {
  type: string
  [key: string]: any
}

type MessageHandler = (message: any) => void

export function useWebSocket(userId: string | null | undefined) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 3
  const messageHandlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map())
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Funkcja do dodawania handlera wiadomości
  const on = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set())
    }
    messageHandlersRef.current.get(type)?.add(handler)

    // Funkcja do usuwania handlera
    return () => {
      messageHandlersRef.current.get(type)?.delete(handler)
      if (messageHandlersRef.current.get(type)?.size === 0) {
        messageHandlersRef.current.delete(type)
      }
    }
  }, [])

  // Inicjalizacja WebSocket
  const initWebSocket = useCallback(() => {
    if (!userId) return

    try {
      // Najpierw zainicjuj endpoint
      fetch("/api/websocket")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to initialize WebSocket endpoint: ${response.status}`)
          }
          return response.json()
        })
        .then(() => {
          try {
            const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
              window.location.host
            }/api/websocket?userId=${userId}`

            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
              setIsConnected(true)
              setError(null)
              reconnectAttemptsRef.current = 0

              // Ustaw interwał ping-pong, aby utrzymać połączenie
              pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: "ping" }))
                }
              }, 30000) // Ping co 30 sekund
            }

            ws.onmessage = (event) => {
              try {
                const message = JSON.parse(event.data) as WebSocketMessage

                // Wywołaj handlery dla tego typu wiadomości
                const handlers = messageHandlersRef.current.get(message.type)
                if (handlers) {
                  handlers.forEach((handler) => {
                    try {
                      handler(message)
                    } catch (error) {
                      console.error(`Error in message handler for ${message.type}:`, error)
                    }
                  })
                }
              } catch (error) {
                console.error("Error parsing WebSocket message:", error)
              }
            }

            ws.onerror = (event) => {
              console.error("WebSocket error:", event)
              setError("Błąd połączenia WebSocket")
            }

            ws.onclose = (event) => {
              setIsConnected(false)

              // Wyczyść interwał ping-pong
              if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
                pingIntervalRef.current = null
              }

              // Próba ponownego połączenia
              if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttemptsRef.current++

                if (reconnectTimeoutRef.current) {
                  clearTimeout(reconnectTimeoutRef.current)
                }

                reconnectTimeoutRef.current = setTimeout(() => {
                  initWebSocket()
                }, 2000 * reconnectAttemptsRef.current) // Zwiększaj czas między próbami
                setError("Nie udało się ponownie połączyć")
              }
            }

            wsRef.current = ws
          } catch (error) {
            console.error("Error creating WebSocket:", error)
            setError(`Błąd tworzenia WebSocket: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        })
        .catch((error) => {
          console.error("Error initializing WebSocket endpoint:", error)
          setError(`Błąd inicjalizacji WebSocket: ${error instanceof Error ? error.message : "Unknown error"}`)
        })
    } catch (error) {
      console.error("Error in initWebSocket:", error)
      setError(`Błąd w initWebSocket: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }, [userId])

  // Inicjalizacja WebSocket przy montowaniu komponentu
  useEffect(() => {
    initWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }
    }
  }, [initWebSocket])

  // Funkcja do wysyłania wiadomości
  const sendMessage = useCallback((data: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected")
      return false
    }

    try {
      wsRef.current.send(JSON.stringify(data))
      return true
    } catch (error) {
      console.error("Error sending WebSocket message:", error)
      return false
    }
  }, [])

  // Funkcja do dołączania do konwersacji
  const joinConversation = useCallback(
    (conversationId: string) => {
      return sendMessage({
        type: "join_conversation",
        userId,
        conversationId,
      })
    },
    [sendMessage, userId],
  )

  // Funkcja do opuszczania konwersacji
  const leaveConversation = useCallback(
    (conversationId: string) => {
      return sendMessage({
        type: "leave_conversation",
        userId,
        conversationId,
      })
    },
    [sendMessage, userId],
  )

  // Funkcja do wysyłania statusu pisania
  const sendTypingStatus = useCallback(
    (conversationId: string, isTyping: boolean) => {
      return sendMessage({
        type: "typing",
        userId,
        conversationId,
        isTyping,
      })
    },
    [sendMessage, userId],
  )

  return {
    isConnected,
    error,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingStatus,
    on,
  }
}
