"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Users, Building2, FileText, CheckCircle, XCircle, MoreHorizontal, MessageSquare } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

// Mock data dla użytkowników
const mockUsers = [
  {
    id: 1,
    name: "Jan Kowalski",
    email: "jan.kowalski@example.com",
    type: "individual",
    joinedAt: new Date(2023, 0, 15),
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Anna Nowak",
    email: "anna.nowak@example.com",
    type: "individual",
    joinedAt: new Date(2023, 1, 20),
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Firma XYZ Sp. z o.o.",
    email: "kontakt@firmaxyz.pl",
    type: "business",
    joinedAt: new Date(2023, 2, 10),
    avatar: "/placeholder.svg?height=40&width=40",
    verified: true,
  },
  {
    id: 4,
    name: "Auto Komis Janusz",
    email: "biuro@autokomis.pl",
    type: "business",
    joinedAt: new Date(2023, 3, 5),
    avatar: "/placeholder.svg?height=40&width=40",
    verified: false,
  },
]

// Mock data dla wniosków o weryfikację
const mockVerificationRequests = [
  {
    id: 1,
    companyName: "Nowa Firma Sp. z o.o.",
    email: "kontakt@nowafirma.pl",
    nip: "1234567890",
    requestedAt: new Date(2023, 3, 25),
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    companyName: "Sklep Meblowy Komfort",
    email: "biuro@meble-komfort.pl",
    nip: "9876543210",
    requestedAt: new Date(2023, 3, 28),
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data dla zgłoszonych ogłoszeń
const mockReportedAds = [
  {
    id: 1,
    title: "Sprzedam samochód Toyota Corolla 2018",
    author: "Jan Kowalski",
    reportedAt: new Date(2023, 3, 26),
    reason: "Nieprawdziwe informacje",
    reportCount: 3,
  },
  {
    id: 2,
    title: "Wynajmę mieszkanie w centrum Warszawy",
    author: "Nieruchomości XYZ",
    reportedAt: new Date(2023, 3, 27),
    reason: "Oszustwo",
    reportCount: 5,
  },
]

// Mock data dla zgłoszonych opinii
const mockReportedReviews = [
  {
    id: 1,
    content: "Bardzo słaba obsługa, nie polecam!",
    author: "Anna Nowak",
    company: "Firma XYZ Sp. z o.o.",
    reportedAt: new Date(2023, 3, 25),
    reason: "Obraźliwa treść",
    reportCount: 2,
  },
]

// Mock stats
const mockStats = {
  totalUsers: 156,
  individuals: 120,
  businesses: 36,
  verifiedBusinesses: 22,
  totalAds: 450,
  activeAds: 380,
  reportedAds: 8,
  totalReviews: 210,
  reportedReviews: 5,
}

export default function AdminPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState(mockStats)
  const [users, setUsers] = useState(mockUsers)
  const [verificationRequests, setVerificationRequests] = useState(mockVerificationRequests)
  const [reportedAds, setReportedAds] = useState(mockReportedAds)
  const [reportedReviews, setReportedReviews] = useState(mockReportedReviews)

  const handleVerify = (id: number) => {
    setVerificationRequests(verificationRequests.filter((request) => request.id !== id))

    setStats({
      ...stats,
      verifiedBusinesses: stats.verifiedBusinesses + 1,
    })

    toast({
      title: "Firma zweryfikowana",
      description: "Status firmy został zaktualizowany",
    })
  }

  const handleReject = (id: number) => {
    setVerificationRequests(verificationRequests.filter((request) => request.id !== id))

    toast({
      title: "Weryfikacja odrzucona",
      description: "Firma została powiadomiona o odrzuceniu weryfikacji",
    })
  }

  const handleApproveAd = (id: number) => {
    setReportedAds(reportedAds.filter((ad) => ad.id !== id))

    setStats({
      ...stats,
      reportedAds: stats.reportedAds - 1,
    })

    toast({
      title: "Ogłoszenie zatwierdzone",
      description: "Ogłoszenie pozostanie aktywne",
    })
  }

  const handleRemoveAd = (id: number) => {
    setReportedAds(reportedAds.filter((ad) => ad.id !== id))

    setStats({
      ...stats,
      reportedAds: stats.reportedAds - 1,
      activeAds: stats.activeAds - 1,
    })

    toast({
      title: "Ogłoszenie usunięte",
      description: "Ogłoszenie zostało usunięte z platformy",
    })
  }

  const handleApproveReview = (id: number) => {
    setReportedReviews(reportedReviews.filter((review) => review.id !== id))

    setStats({
      ...stats,
      reportedReviews: stats.reportedReviews - 1,
    })

    toast({
      title: "Opinia zatwierdzona",
      description: "Opinia pozostanie aktywna",
    })
  }

  const handleRemoveReview = (id: number) => {
    setReportedReviews(reportedReviews.filter((review) => review.id !== id))

    setStats({
      ...stats,
      reportedReviews: stats.reportedReviews - 1,
    })

    toast({
      title: "Opinia usunięta",
      description: "Opinia została usunięta z platformy",
    })
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Panel administracyjny</h1>
          <p className="text-muted-foreground">Zarządzaj użytkownikami, ogłoszeniami i opiniami</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Osoby: {stats.individuals}</span>
                <span>Firmy: {stats.businesses}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zweryfikowane firmy</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedBusinesses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.verifiedBusinesses / stats.businesses) * 100)}% wszystkich firm
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktywne ogłoszenia</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAds}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.reportedAds} zgłoszonych</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opinie</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.reportedReviews} zgłoszonych</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verification">
          <TabsList className="w-full">
            <TabsTrigger value="verification" className="flex-1">
              Weryfikacja firm
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              Użytkownicy
            </TabsTrigger>
            <TabsTrigger value="reported" className="flex-1">
              Zgłoszone treści
            </TabsTrigger>
          </TabsList>
          <TabsContent value="verification" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Wnioski o weryfikację</CardTitle>
                <CardDescription>Zatwierdź lub odrzuć wnioski o weryfikację firm</CardDescription>
              </CardHeader>
              <CardContent>
                {verificationRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Firma</TableHead>
                        <TableHead>NIP</TableHead>
                        <TableHead>Data wniosku</TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.avatar} alt={request.companyName} />
                                <AvatarFallback>{request.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div>{request.companyName}</div>
                                <div className="text-xs text-muted-foreground">{request.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{request.nip}</TableCell>
                          <TableCell>{request.requestedAt.toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-green-500"
                                onClick={() => handleVerify(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Zatwierdź
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-destructive"
                                onClick={() => handleReject(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Odrzuć
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Brak wniosków o weryfikację</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Użytkownicy</CardTitle>
                <CardDescription>Lista wszystkich użytkowników platformy</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Użytkownik</TableHead>
                      <TableHead>Typ konta</TableHead>
                      <TableHead>Data rejestracji</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                {user.name}
                                {user.verified && (
                                  <span className="text-primary" title="Zweryfikowany">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.type === "individual" ? "Osoba prywatna" : "Firma"}</Badge>
                        </TableCell>
                        <TableCell>{user.joinedAt.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Wyświetl profil</DropdownMenuItem>
                              <DropdownMenuItem>Edytuj użytkownika</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Zablokuj konto</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reported" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Zgłoszone ogłoszenia</CardTitle>
                  <CardDescription>Ogłoszenia zgłoszone przez użytkowników</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportedAds.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ogłoszenie</TableHead>
                          <TableHead>Powód</TableHead>
                          <TableHead className="text-right">Akcje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportedAds.map((ad) => (
                          <TableRow key={ad.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{ad.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  Autor: {ad.author} • Zgłoszeń: {ad.reportCount}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-destructive border-destructive/30">
                                {ad.reason}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleApproveAd(ad.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Zatwierdź
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-destructive"
                                  onClick={() => handleRemoveAd(ad.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Usuń
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Brak zgłoszonych ogłoszeń</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Zgłoszone opinie</CardTitle>
                  <CardDescription>Opinie zgłoszone przez użytkowników</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportedReviews.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Opinia</TableHead>
                          <TableHead>Powód</TableHead>
                          <TableHead className="text-right">Akcje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportedReviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">"{review.content}"</div>
                                <div className="text-xs text-muted-foreground">
                                  Autor: {review.author} • Firma: {review.company}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-destructive border-destructive/30">
                                {review.reason}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleApproveReview(review.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Zatwierdź
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-destructive"
                                  onClick={() => handleRemoveReview(review.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Usuń
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Brak zgłoszonych opinii</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}

