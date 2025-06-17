"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"

export function useSocket(userId: string | null | undefined) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const initializingRef = useRef(false)

  // Inicjalizacja Socket.IO
  useEffect(() => {
    if (!userId || initializingRef.current) return

    initializingRef.current = true

    // Funkcja do inicjalizacji Socket.IO
    const initSocket = async () => {
      try {
        const response = await fetch("/api/socketio")

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to initialize Socket.IO: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const data = await response.json()
        const socket = io({
          path: "/api/socketio",
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          transports: ["polling", "websocket"], // Najpierw polling, potem WebSocket
          forceNew: true,
        })

        // Obsługa zdarzeń
        socket.on("connect", () => {
          setIsConnected(true)
          setError(null)

          // Zarejestruj użytkownika
          socket.emit("user_connect", userId)
        })

        socket.on("connect_error", (err) => {
          setError(`Błąd połączenia: ${err.message}`)
        })

        socket.on("disconnect", (reason) => {
          setIsConnected(false)
        })

        socket.on("reconnect_failed", () => {
          console.error("Socket.IO reconnection failed")
          setError("Nie udało się ponownie połączyć")
        })

        socket.on("connection_established", (data) => {
        })

        socketRef.current = socket
      } catch (err) {
        console.error("Error initializing Socket.IO:", err)
        setError(`Błąd inicjalizacji: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        initializingRef.current = false
      }
    }

    initSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      initializingRef.current = false
    }
  }, [userId])

  // Funkcja do dołączania do konwersacji
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (!socketRef.current || !isConnected || !userId) return
      socketRef.current.emit("join_conversation", { userId, conversationId })
    },
    [isConnected, userId],
  )

  // Funkcja do opuszczania konwersacji
  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (!socketRef.current || !isConnected || !userId) return
      socketRef.current.emit("leave_conversation", { userId, conversationId })
    },
    [isConnected, userId],
  )

  // Funkcja do wysyłania wiadomości
  const sendMessage = useCallback(
    (message: any) => {
      if (!socketRef.current || !isConnected || !userId) return false
      socketRef.current.emit("new_message", { message, userId })
      return true
    },
    [isConnected, userId],
  )

  // Funkcja do wysyłania statusu pisania
  const sendTypingStatus = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (!socketRef.current || !isConnected || !userId) return

      socketRef.current.emit("typing", { userId, conversationId, isTyping })
    },
    [isConnected, userId],
  )

  // Funkcja do nasłuchiwania zdarzeń
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!socketRef.current) return () => {}

    socketRef.current.on(event, callback)
    return () => {
      socketRef.current?.off(event, callback)
    }
  }, [])

  return {
    isConnected,
    error,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingStatus,
    on,
  }
}
