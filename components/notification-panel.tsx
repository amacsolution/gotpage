"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Bell, Check, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Notification {
  id: number
  title: string
  content: string
  type: string
  isRead: boolean
  relatedId?: number
  relatedType?: string
  createdAt: string
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const { toast } = useToast()
  const { user, refetchUser } = useUser()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      const count = await fetch("/api/notifications/count")

      if (!response.ok || !count.ok) {
        throw new Error("Nie udało się pobrać powiadomień")
      }


      const data = await response.json()
      const countData = await count.json()
      setNotifications(data)
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać powiadomień" + error,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Nie udało się oznaczyć powiadomienia jako przeczytane")
      }

      // Aktualizacja stanu lokalnie
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))

      // Odświeżenie licznika powiadomień
      refetchUser()
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się oznaczyć powiadomienia jako przeczytane",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true)
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Nie udało się oznaczyć wszystkich powiadomień jako przeczytane")
      }

      // Aktualizacja stanu lokalnie
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))

      // Odświeżenie licznika powiadomień
      refetchUser()

      toast({
        title: "Sukces",
        description: "Wszystkie powiadomienia oznaczone jako przeczytane",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się oznaczyć wszystkich powiadomień jako przeczytane",
        variant: "destructive",
      })
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Nie udało się usunąć powiadomienia")
      }

      // Aktualizacja stanu lokalnie
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))

      toast({
        title: "Sukces",
        description: "Powiadomienie zostało usunięte",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć powiadomienia",
        variant: "destructive",
      })
    }
  }

  // Renderowanie zawartości powiadomień
  const renderNotificationContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-1" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (notifications.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Brak powiadomień</p>
        </div>
      )
    }

    return (
      <>
        <div className="flex justify-between items-center p-2">
          <span className="text-sm font-medium pl-2">{notifications.filter((n) => !n.isRead).length} nieprzeczytanych</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={isMarkingAllRead || notifications.every((n) => n.isRead)}
          >
            {isMarkingAllRead ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
            <span>Odznacz wszystkie</span>
          </Button>
        </div>
        <Separator />
        <ScrollArea className="h-[300px] md:h-[400px]">
          <div className="space-y-1 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg hover:bg-muted transition-colors relative ${!notification.isRead ? "bg-muted/50" : ""
                  }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3" />
                        <span className="sr-only">Oznacz jako przeczytane</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Usuń</span>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </div>
                {!notification.isRead && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </>
    )
  }

  // Renderowanie panelu powiadomień w zależności od urządzenia
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className={`relative after:bg-red-600 after:rounded-full after:absolute after:content-[${notifications.length}]`} onClick={fetchNotifications}>
            <Bell className="h-5 w-5" />
            {user && user.notifications! > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {user.notifications! > 99 ? "99+" : user.notifications}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Powiadomienia</SheetTitle>
          </SheetHeader>
          {renderNotificationContent()}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative after:bg-red-600 after:rounded-full after:absolute after:content-[${notifications.length}]`} onClick={fetchNotifications}>
          <Bell className="h-5 w-5" />
          {user && user.notifications! > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {user.notifications! > 99 ? "99+" : user.notifications}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        {renderNotificationContent()}
      </PopoverContent>
    </Popover>
  )
}

