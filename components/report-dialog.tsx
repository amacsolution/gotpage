"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Flag } from "lucide-react"
import { toast } from "sonner"

interface ReportDialogProps {
  reportedType: "ad" | "comment" | "user"
  reportedId: number
  trigger?: React.ReactNode
}

export function ReportDialog({ reportedType, reportedId, trigger }: ReportDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const session = localStorage.getItem("userData")
  const parsedSession = session ? JSON.parse(session) : null

  const handleSubmit = async () => {
    if (!session) {
      toast.error("Musisz być zalogowany, aby zgłosić treść")
      router.push("/login")
      return
    }

    if (!reason.trim()) {
      toast.error("Podaj powód zgłoszenia")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedType,
          reportedId,
          reason,
        }),
      })

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas zgłaszania")
      }

      toast.success("Zgłoszenie zostało wysłane")
      setReason("")
      setIsOpen(false)
    } catch (error) {
      toast.error("Nie udało się wysłać zgłoszenia")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getReportTypeText = () => {
    switch (reportedType) {
      case "ad":
        return "ogłoszenie"
      case "comment":
        return "komentarz"
      case "user":
        return "użytkownika"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="h-4 w-4 mr-1" />
            Zgłoś
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zgłoś {getReportTypeText()}</DialogTitle>
          <DialogDescription>
            Opisz, dlaczego zgłaszasz to {getReportTypeText()}. Nasi moderatorzy przejrzą zgłoszenie.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Powód zgłoszenia..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

