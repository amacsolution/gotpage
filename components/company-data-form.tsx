"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Define a service schema
const serviceSchema = z.object({
  name: z.string().min(1, { message: "Nazwa usługi jest wymagana" }),
  description: z.string().optional(),
  price: z.string().optional(),
})

// Define the form schema
const formSchema = z.object({
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
  services: z.array(serviceSchema).nonempty({ message: "Usługi nie mogą być puste" }),
})

// Define the service type
type Service = {
  name: string
  description?: string
  price?: string
}

// Parse services string to array of service objects
const parseServicesString = (servicesString?: string): Service[] => {
  if (!servicesString) return []

  try {
    return JSON.parse(servicesString)
  } catch (error) {
    // If the string is not valid JSON, try to create a single service
    if (servicesString.trim()) {
      return [{ name: servicesString.trim(), description: "", price: "" }]
    }
    return []
  }
}

// Stringify services array to JSON string
const stringifyServices = (services: Service[]): string => {
  return JSON.stringify(services)
}

interface CompanyDataFormProps {
  userId: number
  initialData: {
    nip?: string
    regon?: string
    krs?: string
    website?: string
    company_size?: string
    services?: string
  }
  onUpdate: (data: any) => void
  onCancel: () => void
}

export function CompanyDataForm({ userId, initialData, onUpdate, onCancel }: CompanyDataFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Parse initial services
  const initialServices = parseServicesString(initialData.services)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nip: initialData?.nip || "",
      regon: initialData?.regon || "",
      krs: initialData?.krs || "",
      website: initialData?.website || "",
      company_size: initialData?.company_size || "",
      services: initialServices.length > 0 ? initialServices : [],
    },
  })

  // Use field array for dynamic services
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Convert services array to JSON string
      const dataToSubmit = {
        ...values,
        services: stringifyServices(values.services),
      }

      const response = await fetch(`/api/users/${userId}/company`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
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

            {/* Services section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-base">Usługi</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", description: "", price: "" })}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj usługę
                </Button>
              </div>
              <FormDescription className="mb-4">Dodaj usługi oferowane przez Twoją firmę</FormDescription>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Usługa {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isLoading || fields.length === 1}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Usuń usługę</span>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name={`services.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa usługi</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} placeholder="np. Konsultacja" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`services.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opis usługi</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={isLoading}
                              placeholder="Krótki opis usługi"
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`services.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cena</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} placeholder="np. 100 zł/h lub 'od 500 zł'" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

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
