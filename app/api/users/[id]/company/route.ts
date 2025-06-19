import { NextResponse } from "next/server"
import { db, query } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"

const companyDataSchema = z.object({
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
  services: z.string().optional(),
})

export type BusinessData = {
  nip: string | null;
  regon: string | null;
  krs: string | null;
  website: string | null;
  company_size: string | null;
  services: string | null;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    const { id } = await params
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }
    // Pobranie i walidacja danych
    const body = await request.json()
    const result = companyDataSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { nip, regon, krs, website, company_size, services } = result.data

    // Aktualizacja danych firmy w bazie danych
    // Najpierw sprawdzamy, czy istnieje rekord w tabeli business_details
    const businessDataResult = await query("SELECT * FROM business_details WHERE user_id = ?", [id]) as BusinessData[]

    if (businessDataResult.length === 0) {
      // Jeśli nie istnieje, tworzymy nowy rekord
      await query("INSERT INTO business_details (user_id, nip, regon, krs) VALUES (?, ?, ?, ?)", [
        id,
        nip || null,
        regon || null,
        krs || null,
      ])
    } else {
      // Jeśli istnieje, aktualizujemy
      await query("UPDATE business_details SET nip = ?, regon = ?, krs = ? WHERE user_id = ?", [
        nip || null,
        regon || null,
        krs || null,
        id,
      ])
    }

    // Aktualizacja danych w tabeli users
    await query("UPDATE users SET website = ?, company_size = ?, services = ? WHERE id = ?", [
      website || null,
      company_size || null,
      services || null,
      id,
    ])

    // Zwracamy zaktualizowane dane
    return NextResponse.json({
      nip,
      regon,
      krs,
      website,
      company_size,
      services,
    })
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych firmy:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas aktualizacji danych firmy",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}
