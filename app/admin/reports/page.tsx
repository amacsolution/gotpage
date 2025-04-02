"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Reports = {
    id: number,
    type: "user" | "ad_comment" | "news_comment" | "ad",
    targetId: number,
    reason: string,
    status: string,
    createdAt: string,
    reportedBy: string,
    targetTitle: string,
    description: string

}

export default function ReportsPage() {
  const [reports, setReports] = useState<Reports[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
  }, [activeTab])

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      // Pobierz zgłoszenia z API z filtrowaniem według statusu
      const status = activeTab !== "all" ? activeTab : ""
      const response = await fetch(`/api/admin/reports${status ? `?status=${status}` : ""}`, {
        credentials: "include", // Dołącz ciasteczka
      })

      if (!response.ok) {
        throw new Error("Błąd podczas pobierania zgłoszeń")
      }

      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error("Błąd podczas pobierania zgłoszeń:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zgłoszeń",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async ({reportId, newStatus } : {reportId : number, newStatus : string}) => {
    try {
      console.log(reportId, newStatus)

      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: reportId, status: newStatus }),
      }) 
      if (!response.ok) {
        throw new Error("Błąd podczas aktualizacji statusu")
      }

      // Aktualizuj lokalny stan
      setReports(reports.map((report) => (report.id === reportId ? { ...report, status: newStatus } : report)))

      console.log(reports)

      toast({
        title: "Sukces",
        description: "Status zgłoszenia został zaktualizowany",
      })
    } catch (error) {
      console.error("Błąd podczas aktualizacji statusu:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu zgłoszenia",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async ({reportId} : {reportId : number}) => {
    try {
      const response = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Błąd podczas usuwania zgłoszenia")
      }

      // Aktualizuj lokalny stan
      setReports(reports.filter((report) => report.id !== reportId))

      toast({
        title: "Sukces",
        description: "Zgłoszenie zostało usunięte",
      })
    } catch (error) {
      console.error("Błąd podczas usuwania zgłoszenia:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zgłoszenia",
        variant: "destructive",
      })
    }
  }

  const filteredReports = activeTab === "all" ? reports : reports.filter((report) => report.status === activeTab)

  const getStatusBadge = ({status} : {status : string}) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Oczekujące
          </Badge>
        )
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Przejrzane
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Rozwiązane
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Odrzucone
          </Badge>
        )
      default:
        return <Badge variant="outline">Nieznany</Badge>
    }
  }

  const getTypeIcon = ({type} : {type : "user" | "ad_comment" | "ad" | "news_comment"}) => {
    switch (type) {
      case "ad":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Ogłoszenie
          </Badge>
        )
      case "ad_comment":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Komentarz ogłoszenia
          </Badge>
        )
      case "news_comment":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Komentarz wpisu
          </Badge>
        )
      case "user":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Użytkownik
          </Badge>
        )
      default:
        return <Badge variant="outline">Nieznany</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zgłoszenia</h1>
        <Button onClick={fetchReports}>Odśwież</Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          <TabsTrigger value="pending">
            Oczekujące
            {reports.filter((r) => r.status === "pending").length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {reports.filter((r) => r.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Przejrzane</TabsTrigger>
          <TabsTrigger value="resolved">Rozwiązane</TabsTrigger>
          <TabsTrigger value="rejected">Odrzucone</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <div className="flex justify-center items-center h-96 w-96 absolute">
              Ładowanie...
            <Loader2 className="inline mr-2 w-4 h-4 animate-spin" />
          </div>
        </TabsContent>
      </Tabs>
      </div>
  )}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zgłoszenia</h1>
        <Button onClick={fetchReports}>Odśwież</Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          <TabsTrigger value="pending">
            Oczekujące
            {reports.filter((r) => r.status === "pending").length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {reports.filter((r) => r.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Przejrzane</TabsTrigger>
          <TabsTrigger value="resolved">Rozwiązane</TabsTrigger>
          <TabsTrigger value="rejected">Odrzucone</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista zgłoszeń</CardTitle>
              <CardDescription>
                {activeTab === "all"
                  ? "Wszystkie zgłoszenia"
                  : activeTab === "pending"
                    ? "Oczekujące zgłoszenia"
                    : activeTab === "reviewed"
                      ? "Przejrzane zgłoszenia"
                      : activeTab === "resolved"
                        ? "Rozwiązane zgłoszenia"
                        : "Odrzucone zgłoszenia"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReports.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">Brak zgłoszeń w tej kategorii</div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report : Reports) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon({ type: report.type })}
                            <h3 className="text-lg font-semibold">{report.targetTitle}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Zgłoszone przez: {report.reportedBy} • {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>{getStatusBadge({ status: report.status })}</div>
                      </div>

                      <div className="mb-4">
                        <p className="mb-1 font-medium">Powód: {report.reason}</p>
                        <p className="text-sm">{report.description}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {report.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange({ reportId: report.id, newStatus: "reviewed" })}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Oznacz jako przejrzane
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleStatusChange({ reportId: report.id, newStatus: "resolved" })}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Rozwiąż
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleStatusChange({ reportId: report.id, newStatus: "rejected" })}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Odrzuć
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete({ reportId: report.id })}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Usuń
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

