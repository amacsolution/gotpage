import { NextResponse } from "next/server"
import { db } from "@/lib/db"
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
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {

  const { id } = await params
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Sprawdzenie, czy użytkownik ma uprawnienia do edycji
    if (String(user.id) !== id) {
      return NextResponse.json({ error: "Brak uprawnień do edycji tych danych" }, { status: 403 })
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

    const { nip, regon, krs, website, company_size } = result.data

    // Aktualizacja danych firmy w bazie danych
    // Najpierw sprawdzamy, czy istnieje rekord w tabeli business_data
    const businessDataResult = await db.query("SELECT * FROM business_details WHERE user_id = ?", [id])

    if (businessDataResult.length === 0) {
      // Jeśli nie istnieje, tworzymy nowy rekord
      await db.query("INSERT INTO business_details (user_id, nip, regon, krs) VALUES (?, ?, ?, ?)", [
        id,
        nip || null,
        regon || null,
        krs || null,
      ])
    } else {
      // Jeśli istnieje, aktualizujemy
      await db.query("UPDATE business_details SET nip = ?, regon = ?, krs = ? WHERE user_id = ?", [
        nip || null,
        regon || null,
        krs || null,
        id,
      ])
    }

    // Aktualizacja danych w tabeli users
    await db.query("UPDATE users SET website = ?, company_size = ? WHERE id = ?", [
      website || null,
      company_size || null,
      id,
    ])

    // Zwracamy zaktualizowane dane
    return NextResponse.json({
      nip,
      regon,
      krs,
      website,
      company_size,
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
