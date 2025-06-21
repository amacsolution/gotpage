"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, FileText, MessageSquare, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Activity = {
  type: "user" | "ad" | "comment" | "report";
  user?: string;
  action?: string;
  title?: string;
  target?: string;
  time: string;
  // add other fields as needed
};

export default function AdminPage() {
  const [stats, setStats] = useState({
    users: { total: 0, today: 0 },
    ads: { total: 0, today: 0 },
    comments: { total: 0, today: 0 },
    reports: { total: 0, pending: 0, today: 0 },
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/dashboard?period=${period}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Błąd podczas pobierania danych dashboardu")
      }

      const data = await response.json()
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
    } catch (error) {
      console.error("Błąd podczas pobierania danych dashboardu:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych dashboardu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (dateString : string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sekund temu`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minut temu`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} godzin temu`
    } else {
      return `${Math.floor(diffInSeconds / 86400)} dni temu`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Okres:</span>
            <select
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="all">Wszystko</option>
              <option value="today">Dzisiaj</option>
              <option value="week">Ostatni tydzień</option>
              <option value="month">Ostatni miesiąc</option>
            </select>
          </div>
          <Button onClick={fetchDashboardData} disabled={isLoading}>
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Odśwież
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Użytkownicy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">+{stats.users.today} dzisiaj</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ogłoszenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.ads.total}</div>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">+{stats.ads.today} dzisiaj</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Komentarze</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.comments.total}</div>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">+{stats.comments.today} dzisiaj</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zgłoszenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.reports.total}</div>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stats.reports.pending} oczekujących</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Ostatnia aktywność</TabsTrigger>
          <TabsTrigger value="stats">Statystyki</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ostatnia aktywność</CardTitle>
              <CardDescription>Najnowsze działania użytkowników na platformie</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">Brak aktywności do wyświetlenia</div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity : Activity, index) => (
                    <div key={index} className="flex items-start pb-4 space-x-4 border-b last:border-0">
                      <div className="p-2 rounded-full bg-primary/10">
                        {activity.type === "user" && <Users className="w-4 h-4 text-primary" />}
                        {activity.type === "ad" && <FileText className="w-4 h-4 text-primary" />}
                        {activity.type === "comment" && <MessageSquare className="w-4 h-4 text-primary" />}
                        {activity.type === "report" && <AlertTriangle className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action === "registered" && "zarejestrował(a) się"}
                          {activity.action === "created" && `dodał(a) ogłoszenie "${activity.title}"`}
                          {activity.action === "submitted" && `zgłosił(a) ${activity.target}`}
                          {activity.action === "added" && `skomentował(a) ogłoszenie "${activity.title}"`}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
              <CardDescription>Analiza aktywności na platformie w wybranym okresie</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 text-lg font-medium">Użytkownicy</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Łącznie:</span>
                          <span className="font-medium">{stats.users.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dzisiaj:</span>
                          <span className="font-medium">{stats.users.today}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 text-lg font-medium">Ogłoszenia</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Łącznie:</span>
                          <span className="font-medium">{stats.ads.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dzisiaj:</span>
                          <span className="font-medium">{stats.ads.today}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 text-lg font-medium">Komentarze</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Łącznie:</span>
                          <span className="font-medium">{stats.comments.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dzisiaj:</span>
                          <span className="font-medium">{stats.comments.today}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 text-lg font-medium">Zgłoszenia</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Łącznie:</span>
                          <span className="font-medium">{stats.reports.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Oczekujące:</span>
                          <span className="font-medium">{stats.reports.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dzisiaj:</span>
                          <span className="font-medium">{stats.reports.today}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

