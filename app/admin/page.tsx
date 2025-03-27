"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, FileText, MessageSquare, AlertTriangle, Activity } from "lucide-react"

export default function AdminPage() {
  const [stats, setStats] = useState({
    users: 0,
    ads: 0,
    comments: 0,
    reports: 0,
    pendingReports: 0,
    newUsersToday: 0,
    newAdsToday: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // W rzeczywistej aplikacji, pobieralibyśmy dane z API
      // Tutaj symulujemy dane dla demonstracji
      setTimeout(() => {
        setStats({
          users: 1245,
          ads: 3782,
          comments: 9431,
          reports: 87,
          pendingReports: 23,
          newUsersToday: 15,
          newAdsToday: 42,
        })

        setRecentActivity([
          { type: "user", action: "registered", user: "jan.kowalski", time: "10 minut temu" },
          { type: "ad", action: "created", user: "anna.nowak", title: "iPhone 13 Pro", time: "25 minut temu" },
          {
            type: "report",
            action: "submitted",
            user: "marek.wiśniewski",
            target: "Ogłoszenie #1234",
            time: "45 minut temu",
          },
          {
            type: "comment",
            action: "added",
            user: "katarzyna.lewandowska",
            ad: "Laptop Dell XPS",
            time: "1 godzinę temu",
          },
          {
            type: "ad",
            action: "promoted",
            user: "piotr.zieliński",
            title: "Mieszkanie do wynajęcia",
            time: "2 godziny temu",
          },
        ])

        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Ładowanie...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => fetchDashboardData()}>Odśwież</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Użytkownicy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.users}</div>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">+{stats.newUsersToday} dzisiaj</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ogłoszenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.ads}</div>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">+{stats.newAdsToday} dzisiaj</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Komentarze</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.comments}</div>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zgłoszenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.reports}</div>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stats.pendingReports} oczekujących</p>
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
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
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
                        {activity.action === "added" && `skomentował(a) ogłoszenie "${activity.ad}"`}
                        {activity.action === "promoted" && `promował(a) ogłoszenie "${activity.title}"`}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
              <CardDescription>Analiza aktywności na platformie w ostatnim miesiącu</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
              <div className="space-y-2 text-center">
                <Activity className="mx-auto w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground">Statystyki będą dostępne wkrótce</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

