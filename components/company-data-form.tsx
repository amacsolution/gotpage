"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const companyFormSchema = z.object({
  nip: z
    .string()
    .regex(/^\d{10}$/, {
      message: "NIP musi składać się z 10 cyfr",
    })
    .optional()
    .or(z.literal("")),
  regon: z
    .string()
    .regex(/^\d{9}(\d{5})?$/, {
      message: "REGON musi składać się z 9 lub 14 cyfr",
    })
    .optional()
    .or(z.literal("")),
  krs: z
    .string()
    .regex(/^\d{10}$/, {
      message: "KRS musi składać się z 10 cyfr",
    })
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url({
      message: "Wprowadź poprawny adres URL",
    })
    .optional()
    .or(z.literal("")),
  company_size: z.string().optional(),
})

interface CompanyDataFormProps {
  userId: number
  initialData: {
    nip?: string
    regon?: string
    krs?: string
    website?: string
    company_size?: string
  }
  onUpdate: (data: z.infer<typeof companyFormSchema>) => void
  onCancel: () => void
}

export function CompanyDataForm({ userId, initialData, onUpdate, onCancel }: CompanyDataFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      nip: initialData.nip || "",
      regon: initialData.regon || "",
      krs: initialData.krs || "",
      website: initialData.website || "",
      company_size: initialData.company_size || "",
    },
  })

  async function onSubmit(values: z.infer<typeof companyFormSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}/company`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Wystąpił błąd podczas aktualizacji danych firmy")
      }

      const updatedData = await response.json()
      onUpdate(updatedData)

      toast({
        title: "Dane firmy zaktualizowane",
        description: "Dane Twojej firmy zostały pomyślnie zaktualizowane",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji danych firmy",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Edytuj dane firmy</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="np. 1234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="regon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REGON</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="np. 123456789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="krs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KRS</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="np. 0000123456" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strona internetowa</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="np. https://twojafirma.pl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wielkość firmy</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="np. 10-50 pracowników" />
                  </FormControl>
                  <FormDescription>Podaj przybliżoną liczbę pracowników</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Anuluj
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  "Zapisz zmiany"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
