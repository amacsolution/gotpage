"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, Trash2 } from "lucide-react"

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      // W rzeczywistej aplikacji, pobieralibyśmy dane z API
      // Tutaj symulujemy dane dla demonstracji
      setTimeout(() => {
        setReports([
          {
            id: 1,
            type: "ad",
            targetId: 1234,
            targetTitle: "iPhone 13 Pro Max",
            reason: "Oszustwo",
            description: "Sprzedający nie wysłał produktu po otrzymaniu płatności.",
            reportedBy: "jan.kowalski",
            status: "pending",
            createdAt: "2023-05-15T10:30:00Z",
          },
          {
            id: 2,
            type: "comment",
            targetId: 5678,
            targetTitle: 'Komentarz do ogłoszenia "Laptop Dell XPS"',
            reason: "Spam",
            description: "Komentarz zawiera linki do podejrzanych stron.",
            reportedBy: "anna.nowak",
            status: "reviewed",
            createdAt: "2023-05-14T15:45:00Z",
          },
          {
            id: 3,
            type: "user",
            targetId: 9012,
            targetTitle: "marek.wiśniewski",
            reason: "Nękanie",
            description: "Użytkownik wysyła obraźliwe wiadomości.",
            reportedBy: "katarzyna.lewandowska",
            status: "resolved",
            createdAt: "2023-05-13T09:15:00Z",
          },
          {
            id: 4,
            type: "ad",
            targetId: 3456,
            targetTitle: "Mieszkanie do wynajęcia",
            reason: "Fałszywe informacje",
            description: "Ogłoszenie zawiera nieprawdziwe informacje o lokalizacji.",
            reportedBy: "piotr.zieliński",
            status: "rejected",
            createdAt: "2023-05-12T14:20:00Z",
          },
          {
            id: 5,
            type: "comment",
            targetId: 7890,
            targetTitle: 'Komentarz do ogłoszenia "Samochód BMW"',
            reason: "Obraźliwa treść",
            description: "Komentarz zawiera wulgarne słowa.",
            reportedBy: "tomasz.kowalczyk",
            status: "pending",
            createdAt: "2023-05-11T11:10:00Z",
          },
        ])

        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching reports:", error)
      setIsLoading(false)
    }
  }

  const handleStatusChange = (reportId, newStatus) => {
    setReports(reports.map((report) => (report.id === reportId ? { ...report, status: newStatus } : report)))
  }

  const handleDelete = (reportId) => {
    setReports(reports.filter((report) => report.id !== reportId))
  }

  const filteredReports = activeTab === "all" ? reports : reports.filter((report) => report.status === activeTab)

  const getStatusBadge = (status) => {
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

  const getTypeIcon = (type) => {
    switch (type) {
      case "ad":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Ogłoszenie
          </Badge>
        )
      case "comment":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Komentarz
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
    return <div className="flex items-center justify-center h-full">Ładowanie...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zgłoszenia</h1>
        <Button onClick={fetchReports}>Odśwież</Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          <TabsTrigger value="pending">Oczekujące</TabsTrigger>
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
                  {filteredReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(report.type)}
                            <h3 className="text-lg font-semibold">{report.targetTitle}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Zgłoszone przez: {report.reportedBy} • {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>{getStatusBadge(report.status)}</div>
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
                              onClick={() => handleStatusChange(report.id, "reviewed")}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Oznacz jako przejrzane
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleStatusChange(report.id, "resolved")}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Rozwiąż
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleStatusChange(report.id, "rejected")}
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
                          onClick={() => handleDelete(report.id)}
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

