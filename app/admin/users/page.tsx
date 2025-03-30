"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShieldCheck, Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify")
        const data = await res.json()

        if (!data.authenticated) {
          router.push("/admin/login")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Błąd weryfikacji:", error)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users")
        const usersData = await res.json()
        setUsers(usersData)
      } catch (error) {
        console.error("Błąd pobierania:", error)
      }
    }

    fetchUsers()
  }, [])

  const handleOpenNotification = (user: { id: number; name: string; email: string; joinedAt: string; verified: boolean }) => {
    setSelectedUser(user!)
    setNotificationTitle("")
    setNotificationMessage("")
    console.log("Otwieranie powiadomienia dla użytkownika:", user)
    console.log("ID użytkownika:", user.id)
  }

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Błąd",
        description: "Tytuł i treść powiadomienia są wymagane",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      console.log("Wysyłanie powiadomienia:", {
        userId: selectedUser?.id!,
        title: notificationTitle,
        message: notificationMessage,
      })

      // Użyjmy fetch z opcją text() zamiast json() aby zobaczyć dokładną odpowiedź
      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          title: notificationTitle,
          message: notificationMessage,
        }),
      })

      // Najpierw pobierzmy surowy tekst odpowiedzi
      const responseText = await response.text()
      console.log("Surowa odpowiedź:", responseText)

      // Spróbujmy sparsować JSON tylko jeśli to faktycznie JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Sparsowane dane:", data)
      } catch (e) {
        console.log(responseText);
        console.error("Odpowiedź nie jest prawidłowym JSON:", e)
        throw new Error("Otrzymano nieprawidłową odpowiedź z serwera")
      }

      if (response.ok) {
        toast({
          title: "Sukces",
          description: `Powiadomienie zostało wysłane do użytkownika ${selectedUser.name}`,
        })
        setSelectedUser(null)
      } else {
        throw new Error(data.error || "Wystąpił błąd podczas wysyłania powiadomienia")
      }
    } catch (error) {
      console.error("Błąd wysyłania powiadomienia:", error)
      toast({
        title: "Błąd",
        description: (error as Error).message || "Nie udało się wysłać powiadomienia",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Ładowanie...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Użytkownicy</h1>

      <Card>
        <CardHeader>
          <CardTitle>Lista użytkowników</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nazwa użytkownika</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data rejestracji</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: { id: number; name: string; email: string; joinedAt: string; verified: boolean }) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="inline-flex items-center gap-2">
                    {user.verified ? "Zweryfikowany" : "Niezweryfikowany"}
                    {user.verified ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </>
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenNotification(user)}
                          className="flex items-center gap-1"
                        >
                          <Bell className="h-4 w-4" />
                          Powiadom
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Wyślij powiadomienie</DialogTitle>
                          <DialogDescription>
                            Wyślij powiadomienie do użytkownika {(selectedUser! as { name: string })?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notification-title" className="text-right">
                              Tytuł
                            </Label>
                            <Input
                              id="notification-title"
                              value={notificationTitle}
                              onChange={(e) => setNotificationTitle(e.target.value)}
                              className="col-span-3"
                              placeholder="Tytuł powiadomienia"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notification-message" className="text-right">
                              Treść
                            </Label>
                            <Textarea
                              id="notification-message"
                              value={notificationMessage}
                              onChange={(e) => setNotificationMessage(e.target.value)}
                              className="col-span-3"
                              placeholder="Treść powiadomienia"
                              rows={5}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" className="gap-1">
                              <X className="h-4 w-4" />
                              Anuluj
                            </Button>
                          </DialogClose>
                          <Button onClick={handleSendNotification} disabled={isSending} className="gap-1">
                            <Bell className="h-4 w-4" />
                            {isSending ? "Wysyłanie..." : "Wyślij powiadomienie"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

