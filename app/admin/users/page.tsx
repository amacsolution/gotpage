"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500 italic">
                  Brak użytkowników do wyświetlenia
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

