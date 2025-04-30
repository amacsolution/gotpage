"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const testEmailFormSchema = z.object({
  email: z.string().email({
    message: "Wprowadź poprawny adres email",
  }),
  name: z.string().optional(),
  oldServiceName: z.string().default("gotpage"),
  newServiceName: z.string().default("Nowy Serwis Ogłoszeniowy"),
  adminPassword: z.string().min(1, {
    message: "Hasło administratora jest wymagane",
  }),
})

const bulkEmailFormSchema = z.object({
  users: z.string().min(1, {
    message: "Lista użytkowników jest wymagana",
  }),
  oldServiceName: z.string().default("gotpage"),
  newServiceName: z.string().default("Nowy Serwis Ogłoszeniowy"),
  adminPassword: z.string().min(1, {
    message: "Hasło administratora jest wymagane",
  }),
  testMode: z.boolean().default(true),
})

export default function MigrationEmailsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const [jsonFile, setJsonFile] = useState<File | null>(null)

  // Formularz dla pojedynczego emaila testowego
  const testForm = useForm<z.infer<typeof testEmailFormSchema>>({
    resolver: zodResolver(testEmailFormSchema),
    defaultValues: {
      email: "",
      name: "",
      oldServiceName: "gotpage",
      newServiceName: "Nowy Serwis Ogłoszeniowy",
      adminPassword: "",
    },
  })

  // Formularz dla masowej wysyłki
  const bulkForm = useForm<z.infer<typeof bulkEmailFormSchema>>({
    resolver: zodResolver(bulkEmailFormSchema),
    defaultValues: {
      users: "",
      oldServiceName: "gotpage",
      newServiceName: "Nowy Serwis Ogłoszeniowy",
      adminPassword: "",
      testMode: true,
    },
  })

  // Obsługa wysyłki pojedynczego emaila testowego
  async function onTestSubmit(values: z.infer<typeof testEmailFormSchema>) {
    try {
      setIsLoading(true)
      setResults(null)

      const users = [{ email: values.email, name: values.name || "Użytkowniku" }]

      const response = await fetch("/api/admin/send-migration-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${values.adminPassword}`,
        },
        body: JSON.stringify({
          users,
          oldServiceName: values.oldServiceName,
          newServiceName: values.newServiceName,
          testMode: true, // Zawsze w trybie testowym dla pojedynczego emaila
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas wysyłania emaila testowego")
      }

      toast({
        title: "Sukces",
        description: `Email testowy został wysłany na adres ${values.email}`,
      })

      setResults(data.results)
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas wysyłania emaila",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Obsługa masowej wysyłki emaili
  async function onBulkSubmit(values: z.infer<typeof bulkEmailFormSchema>) {
    try {
      setIsLoading(true)
      setResults(null)

      // Parsuj listę użytkowników
      let users
      try {
        users = JSON.parse(values.users)
        if (!Array.isArray(users)) {
          throw new Error("Lista użytkowników musi być tablicą")
        }
      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nieprawidłowy format listy użytkowników. Upewnij się, że to poprawny JSON.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/admin/send-migration-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${values.adminPassword}`,
        },
        body: JSON.stringify({
          users,
          oldServiceName: values.oldServiceName,
          newServiceName: values.newServiceName,
          testMode: values.testMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas wysyłania emaili")
      }

      toast({
        title: "Sukces",
        description: data.message,
      })

      setResults(data.results)
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas wysyłania emaili",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Obsługa wczytywania pliku JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setJsonFile(file)

    try {
      const text = await file.text()
      bulkForm.setValue("users", text)
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wczytać pliku JSON",
        variant: "destructive",
      })
    }
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Wysyłanie emaili migracyjnych</h1>

        <Tabs defaultValue="test">
          <TabsList className="mb-4">
            <TabsTrigger value="test">Email testowy</TabsTrigger>
            <TabsTrigger value="bulk">Masowa wysyłka</TabsTrigger>
          </TabsList>

          {/* Zakładka z emailem testowym */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Wyślij testowy email migracyjny</CardTitle>
                <CardDescription>
                  Wyślij pojedynczy email testowy, aby sprawdzić wygląd i treść wiadomości
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...testForm}>
                  <form onSubmit={testForm.handleSubmit(onTestSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={testForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adres email</FormLabel>
                            <FormControl>
                              <Input placeholder="twoj@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={testForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nazwa użytkownika (opcjonalnie)</FormLabel>
                            <FormControl>
                              <Input placeholder="Jan Kowalski" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={testForm.control}
                        name="oldServiceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nazwa starego serwisu</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={testForm.control}
                        name="newServiceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nazwa nowego serwisu</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={testForm.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hasło administratora</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wysyłanie...
                        </>
                      ) : (
                        "Wyślij email testowy"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zakładka z masową wysyłką */}
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Masowa wysyłka emaili migracyjnych</CardTitle>
                <CardDescription>
                  Wyślij zaproszenia do migracji do wielu użytkowników starego serwisu gotpage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...bulkForm}>
                  <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="jsonFile">Wczytaj plik JSON z listą użytkowników</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            id="jsonFile"
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="max-w-md"
                          />
                          <span className="text-sm text-muted-foreground">
                            {jsonFile ? `Wybrany plik: ${jsonFile.name}` : "Nie wybrano pliku"}
                          </span>
                        </div>
                      </div>

                      <FormField
                        control={bulkForm.control}
                        name="users"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lista użytkowników (JSON)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='[{"email":"wiokka@wp.pl","name":"Sprzęt RTV i AGD"}]'
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Wprowadź listę użytkowników w formacie JSON. Każdy użytkownik powinien mieć pola email i
                              name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={bulkForm.control}
                        name="oldServiceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nazwa starego serwisu</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bulkForm.control}
                        name="newServiceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nazwa nowego serwisu</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={bulkForm.control}
                      name="testMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Tryb testowy</FormLabel>
                            <FormDescription>
                              W trybie testowym emaile będą wysyłane tylko na adresy testowe, a nie do rzeczywistych
                              użytkowników
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hasło administratora</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wysyłanie...
                        </>
                      ) : (
                        "Wyślij emaile"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              {results && (
                <CardFooter className="flex-col items-start">
                  <h3 className="text-lg font-semibold mb-2">Wyniki wysyłki:</h3>
                  <div className="w-full max-h-[300px] overflow-y-auto border rounded-md p-4">
                    <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
