"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Phone, Trash2, User } from "lucide-react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

type ContactMessage = {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  created_at: string
  status: "new" | "in_progress" | "completed" | "archived"
}

type PaginationData = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchMessages(1, statusFilter)
  }, [statusFilter])

  const fetchMessages = async (page: number, status: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/contact?page=${page}&limit=10&status=${status}`)

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error("Nie udało się pobrać wiadomości")
      }

      const data = await response.json()
      setMessages(data.messages)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać wiadomości kontaktowych",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchMessages(page, statusFilter)
  }

  const handleStatusChange = async (messageId: number, newStatus: string) => {
    try {
      setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, status: newStatus as any } : msg)))
      const response = await fetch(`/api/contact/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować statusu")
      }

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus as any })
      }

      toast({
        title: "Status zaktualizowany",
        description: "Status wiadomości został pomyślnie zaktualizowany.",
      })
    } catch (error) {
      // Rollback the status change in case of error
      setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, status: selectedMessage?.status as any } : msg)))
      console.error("Error updating message status:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu wiadomości",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę wiadomość? Tej operacji nie można cofnąć.")) {
      return
    }

    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Nie udało się usunąć wiadomości")
      }

      // Remove the message from the local state
      setMessages(messages.filter((msg) => msg.id !== messageId))

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }

      toast({
        title: "Wiadomość usunięta",
        description: "Wiadomość została pomyślnie usunięta.",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć wiadomości",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">Nowa</Badge>
      case "in_progress":
        return <Badge variant="secondary">W trakcie</Badge>
      case "completed":
        return <Badge variant="default" className="bg-green-400/60">Zakończona</Badge>
      case "archived":
        return <Badge variant="outline">Zarchiwizowana</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: pl })
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Wiadomości kontaktowe</h1>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtruj po statusie:</span>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="new">Nowe</SelectItem>
              <SelectItem value="in_progress">W trakcie</SelectItem>
              <SelectItem value="completed">Zakończone</SelectItem>
              <SelectItem value="archived">Zarchiwizowane</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">Łącznie: {pagination.total} wiadomości</div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Imię i nazwisko</TableHead>
                  <TableHead>Temat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow
                    key={message.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <TableCell className="font-medium">{formatDate(message.created_at)}</TableCell>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMessage(message.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Usuń</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Brak wiadomości</h3>
              <p className="text-muted-foreground">Nie znaleziono żadnych wiadomości kontaktowych.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.page > 1) {
                    handlePageChange(pagination.page - 1)
                  }
                }}
                className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, current page, and pages around current page
                const current = pagination.page
                return page === 1 || page === pagination.totalPages || (page >= current - 1 && page <= current + 1)
              })
              .map((page, i, array) => {
                // Add ellipsis
                const prevPage = array[i - 1]
                const showEllipsisBefore = prevPage && page - prevPage > 1

                return (
                  <div key={page} className="flex items-center">
                    {showEllipsisBefore && (
                      <PaginationItem>
                        <span className="px-2">...</span>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page)
                        }}
                        isActive={page === pagination.page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </div>
                )
              })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.page < pagination.totalPages) {
                    handlePageChange(pagination.page + 1)
                  }
                }}
                className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-3xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedMessage.subject}</DialogTitle>
                <DialogDescription>{formatDate(selectedMessage.created_at)}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedMessage.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                  </div>

                  {selectedMessage.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{selectedMessage.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Status:</p>
                  <Select
                    value={selectedMessage.status}
                    onValueChange={(value) => handleStatusChange(selectedMessage.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nowa</SelectItem>
                      <SelectItem value="in_progress">W trakcie</SelectItem>
                      <SelectItem value="completed">Zakończona</SelectItem>
                      <SelectItem value="archived">Zarchiwizowana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-4 mt-2">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Zamknij
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteMessage(selectedMessage.id)
                    setSelectedMessage(null)
                  }}
                >
                  Usuń wiadomość
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

