"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Bell, Search, ShieldCheck, Trash2, UserCheck, UserX, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  type User = {
    id: number
    name: string
    email: string
    joinedAt: string
    verified: boolean
  }
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<null | {
    id: number
    name: string
    email: string
    joinedAt: string
    verified: boolean
  }>(null)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userToDelete, setUserToDelete] = useState<null | { id: number; name: string }>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null)

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
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (error) {
        console.error("Błąd pobierania:", error)
        setUsers([])
      }
    }

    fetchUsers()
  }, [])

  const handleOpenNotification = (user: {
    id: number
    name: string
    email: string
    joinedAt: string
    verified: boolean
  }) => {
    setSelectedUser(user)
    setNotificationTitle("")
    setNotificationMessage("")
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
      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser?.id ?? 0,
          title: notificationTitle,
          message: notificationMessage,
        }),
      })

      // Najpierw pobierzmy surowy tekst odpowiedzi
      const responseText = await response.text()

      // Spróbujmy sparsować JSON tylko jeśli to faktycznie JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error("Otrzymano nieprawidłową odpowiedź z serwera")
      }

      if (response.ok) {
        toast({
          title: "Sukces",
          description: `Powiadomienie zostało wysłane do użytkownika ${selectedUser?.name}`,
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

  // Funkcja usuwania użytkownika
  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się usunąć użytkownika")
      }

      // Aktualizacja listy użytkowników
      setUsers(users.filter((user: any) => user.id !== userId))

      toast({
        title: "Sukces",
        description: "Użytkownik został usunięty",
      })
    } catch (error) {
      console.error("Błąd usuwania użytkownika:", error)
      toast({
        title: "Błąd",
        description: (error as Error).message || "Nie udało się usunąć użytkownika",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setUserToDelete(null)
    }
  }

  // Funkcja zmiany statusu weryfikacji
  const handleToggleVerification = async (userId: number, currentStatus: boolean) => {
    try {
      setVerifyingUserId(userId)
      const response = await fetch("/api/admin/users/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          verified: !currentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się zmienić statusu weryfikacji")
      }

      // Aktualizacja listy użytkowników
      setUsers(users)

      toast({
        title: "Sukces",
        description: !currentStatus ? "Użytkownik został zweryfikowany" : "Weryfikacja użytkownika została anulowana",
      })
    } catch (error) {
      console.error("Błąd zmiany statusu weryfikacji:", error)
      toast({
        title: "Błąd",
        description: (error as Error).message || "Nie udało się zmienić statusu weryfikacji",
        variant: "destructive",
      })
    } finally {
      setVerifyingUserId(null)
    }
  }

  // Filtrowanie użytkowników na podstawie wyszukiwania
  const filteredUsers = users.filter((user: any) => {
    const query = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toString().includes(query)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Ładowanie...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Użytkownicy</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista użytkowników</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Wyszukaj użytkownika..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nie znaleziono użytkowników</h3>
              <p className="text-muted-foreground mb-4">Spróbuj zmienić kryteria wyszukiwania</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Wyczyść wyszukiwanie
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredUsers.map(
                    (user: { id: number; name: string; email: string; joinedAt: string; verified: boolean }) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.verified ? "default" : "secondary"}
                            className="flex items-center gap-1 w-fit"
                          >
                            {user.verified ? <ShieldCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                            {user.verified ? "Zweryfikowany" : "Niezweryfikowany"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Przycisk weryfikacji */}
                            <Button
                              variant={user.verified ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleVerification(user.id, user.verified)}
                              disabled={verifyingUserId === user.id}
                              className="flex items-center gap-1"
                            >
                              {verifyingUserId === user.id ? (
                                <>
                                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                                  Przetwarzanie...
                                </>
                              ) : (
                                <>
                                  {user.verified ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                  {user.verified ? "Anuluj weryfikację" : "Weryfikuj"}
                                </>
                              )}
                            </Button>

                            {/* Przycisk powiadomienia */}
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
                                    Wyślij powiadomienie do użytkownika {selectedUser?.name}
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

                            {/* Przycisk usuwania */}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setUserToDelete({ id: user.id, name: user.name })}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Usuń
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog potwierdzenia usuwania */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć użytkownika {userToDelete?.name}? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              disabled={isDeleting}
              className="gap-1"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                  Usuwanie...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Usuń użytkownika
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
