"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useWebSocket(userId: string | null | undefined) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 3

  // Inicjalizacja WebSocket
  const initWebSocket = useCallback(() => {
    if (!userId) return

    try {
      console.log("Initializing WebSocket endpoint")
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
            console.log("Connecting to WebSocket")
            const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
              window.location.host
            }/api/websocket?userId=${userId}`
            console.log("WebSocket URL:", wsUrl)

            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
              console.log("WebSocket connected")
              setIsConnected(true)
              setError(null)
              reconnectAttemptsRef.current = 0
            }

            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data)
                console.log("WebSocket message received:", data)
              } catch (error) {
                console.error("Error parsing WebSocket message:", error)
              }
            }

            ws.onerror = (event) => {
              console.error("WebSocket error:", event)
              setError("Błąd połączenia WebSocket")
            }

            ws.onclose = (event) => {
              console.log("WebSocket disconnected:", event.code)
              setIsConnected(false)

              // Próba ponownego połączenia
              if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttemptsRef.current++
                console.log(`Reconnecting attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`)

                if (reconnectTimeoutRef.current) {
                  clearTimeout(reconnectTimeoutRef.current)
                }

                reconnectTimeoutRef.current = setTimeout(() => {
                  initWebSocket()
                }, 2000 * reconnectAttemptsRef.current) // Zwiększaj czas między próbami
              } else {
                console.log("Maximum reconnection attempts reached")
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

  return {
    isConnected,
    error,
    sendMessage,
  }
}
