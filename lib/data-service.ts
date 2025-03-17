import { query } from "@/lib/db"
import { createConnection } from "@/lib/db"

// Sprawdzenie, czy kod jest wykonywany po stronie serwera
const isServer = typeof window === "undefined"

// Mock data dla ogłoszeń
export const mockAds = [
  {
    id: 1,
    title: "Mieszkanie na sprzedaż, 3 pokoje, 60m²",
    description: "Przestronne mieszkanie w centrum miasta z widokiem na park. Idealne dla rodziny lub pod inwestycję.",
    price: 450000,
    location: "Warszawa, Mokotów",
    category: "Nieruchomości",
    subcategory: "Mieszkania",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-15T12:00:00Z",
    views: 120,
    promoted: true,
    author_name: "Biuro Nieruchomości XYZ",
    author_type: "business",
    author_verified: true,
  },
  {
    id: 2,
    title: "Samochód osobowy Toyota Corolla 2019",
    description: "Toyota Corolla z 2019 roku, przebieg 45000 km, benzyna, stan idealny, pierwszy właściciel.",
    price: 65000,
    location: "Kraków, Małopolskie",
    category: "Motoryzacja",
    subcategory: "Samochody osobowe",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-14T10:30:00Z",
    views: 85,
    promoted: false,
    author_name: "Jan Kowalski",
    author_type: "individual",
    author_verified: false,
  },
  {
    id: 3,
    title: "iPhone 13 Pro, 256GB, gwarancja",
    description: "Sprzedam iPhone 13 Pro w idealnym stanie, 256GB pamięci, na gwarancji jeszcze przez rok.",
    price: 3800,
    location: "Wrocław, Dolnośląskie",
    category: "Elektronika",
    subcategory: "Telefony",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-13T15:45:00Z",
    views: 65,
    promoted: true,
    author_name: "Sklep iMobile",
    author_type: "business",
    author_verified: true,
  },
  {
    id: 4,
    title: "Rower górski Kross Level 5.0",
    description: "Rower górski Kross Level 5.0, rozmiar ramy L, koła 29 cali, hamulce tarczowe, stan bardzo dobry.",
    price: 2200,
    location: "Poznań, Wielkopolskie",
    category: "Sport i hobby",
    subcategory: "Rowery",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-12T09:15:00Z",
    views: 42,
    promoted: false,
    author_name: "Marek Nowak",
    author_type: "individual",
    author_verified: false,
  },
]

// Funkcja do pobierania ogłoszeń z bazy danych
export async function getAdsFromDatabase(limit = 10, offset = 0, filters: any = {}) {
  // Jeśli jesteśmy po stronie klienta, zwróć mock data
  if (!isServer) {
    console.log("Używam mock data dla ogłoszeń (klient)")
    return mockAds
  }

  try {
    // Wykonuj zapytanie do bazy tylko po stronie serwera
    const ads = await query(
      "SELECT a.*, u.name as author_name, u.type as author_type, u.verified as author_verified FROM ads a JOIN users u ON a.user_id = u.id WHERE a.active = 1 ORDER BY a.promoted DESC, a.created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    )
    return ads
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszeń z bazy:", error)
    return mockAds
  }
}

// Funkcja do pobierania firm z bazy danych
export async function getCompaniesFromDatabase(limit = 10, offset = 0, filters: any = {}) {
  if (!isServer) {
    console.log("Używam mock data dla firm (klient)")
    return mockCompanies
  }

  try {
    const companies = await query(
      "SELECT u.*, COUNT(r.id) as review_count, AVG(r.rating) as rating FROM users u LEFT JOIN reviews r ON u.id = r.business_id WHERE u.type = 'business' AND u.verified = 1 GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    )
    return companies
  } catch (error) {
    console.error("Błąd podczas pobierania firm z bazy:", error)
    return mockCompanies
  }
}

// Mock data dla firm
export const mockCompanies = [
  {
    id: 1,
    name: "Biuro Nieruchomości XYZ",
    description:
      "Profesjonalne biuro nieruchomości z wieloletnim doświadczeniem. Oferujemy kompleksową obsługę w zakresie sprzedaży, kupna i wynajmu nieruchomości.",
    type: "business",
    verified: true,
    avatar: "/placeholder.svg?height=100&width=100",
    location: "Warszawa, Mazowieckie",
    created_at: "2022-01-15T10:00:00Z",
    review_count: 24,
    rating: 4.7,
  },
  {
    id: 2,
    name: "Auto Komis Premium",
    description:
      "Największy komis samochodowy w regionie. Oferujemy samochody używane z gwarancją, możliwość finansowania oraz profesjonalny serwis.",
    type: "business",
    verified: true,
    avatar: "/placeholder.svg?height=100&width=100",
    location: "Kraków, Małopolskie",
    created_at: "2022-02-20T14:30:00Z",
    review_count: 18,
    rating: 4.2,
  },
  {
    id: 3,
    name: "Sklep iMobile",
    description:
      "Autoryzowany sprzedawca telefonów i akcesoriów. Oferujemy najnowsze modele smartfonów, tabletów oraz akcesoria do nich.",
    type: "business",
    verified: true,
    avatar: "/placeholder.svg?height=100&width=100",
    location: "Wrocław, Dolnośląskie",
    created_at: "2022-03-10T09:15:00Z",
    review_count: 32,
    rating: 4.9,
  },
]

// Funkcja do pobierania kategorii z bazy danych
export async function getCategoriesFromDatabase() {
  if (!isServer) {
    console.log("Używam mock data dla kategorii (klient)")
    return mockCategories
  }

  try {
    const categories = await query(
      "SELECT c.id, c.name, p.id as parent_id, p.name as parent_name FROM categories c LEFT JOIN categories p ON c.parent_id = p.id ORDER BY c.name ASC",
    )
    return categories
  } catch (error) {
    console.error("Błąd podczas pobierania kategorii z bazy:", error)
    return mockCategories
  }
}

// Mock data dla kategorii
export const mockCategories = [
  { id: 1, name: "Nieruchomości", parent_id: null, parent_name: null },
  { id: 2, name: "Mieszkania", parent_id: 1, parent_name: "Nieruchomości" },
  { id: 3, name: "Domy", parent_id: 1, parent_name: "Nieruchomości" },
  { id: 4, name: "Działki", parent_id: 1, parent_name: "Nieruchomości" },
  { id: 5, name: "Motoryzacja", parent_id: null, parent_name: null },
  { id: 6, name: "Samochody osobowe", parent_id: 5, parent_name: "Motoryzacja" },
  { id: 7, name: "Motocykle", parent_id: 5, parent_name: "Motoryzacja" },
  { id: 8, name: "Części", parent_id: 5, parent_name: "Motoryzacja" },
  { id: 9, name: "Elektronika", parent_id: null, parent_name: null },
  { id: 10, name: "Telefony", parent_id: 9, parent_name: "Elektronika" },
  { id: 11, name: "Komputery", parent_id: 9, parent_name: "Elektronika" },
  { id: 12, name: "RTV i AGD", parent_id: 9, parent_name: "Elektronika" },
]

// Funkcja do pobierania szczegółów ogłoszenia z bazy danych
export async function getAdDetailsFromDatabase(id: number) {
  if (!isServer) {
    console.log("Używam mock data dla szczegółów ogłoszenia (klient)")
    return [mockAdDetails]
  }

  try {
    // Sprawdźmy połączenie z bazą danych przed wykonaniem zapytania
    let connection
    try {
      connection = await createConnection()
    } catch (dbError) {
      console.error("Nie można połączyć się z bazą danych:", dbError)
      return [mockAdDetails] // Zwróć mock data, jeśli nie można połączyć się z bazą
    }

    try {
      const [ad] = await connection.execute(
        "SELECT a.*, u.name as author_name, u.type as author_type, u.verified as author_verified, u.email as author_email, u.phone as author_phone, u.avatar as author_avatar FROM ads a JOIN users u ON a.user_id = u.id WHERE a.id = ?",
        [id],
      )

      if (!ad || (Array.isArray(ad) && ad.length === 0)) {
        console.log(`Nie znaleziono ogłoszenia o ID ${id}, używam mock data`)
        await connection.end()
        return [mockAdDetails]
      }

      // Pobierz zdjęcia ogłoszenia
      const [images] = await connection.execute("SELECT image_url FROM ad_images WHERE ad_id = ?", [id])

      // Pobierz komentarze do ogłoszenia
      const [comments] = await connection.execute(
        "SELECT c.*, u.name as author_name, u.avatar as author_avatar FROM ad_comments c JOIN users u ON c.user_id = u.id WHERE c.ad_id = ? ORDER BY c.created_at DESC",
        [id],
      )

      // Zwiększ licznik wyświetleń
      await connection.execute("UPDATE ads SET views = views + 1 WHERE id = ?", [id])

      // Zamknij połączenie
      await connection.end()

      const adWithDetails = {
        ...ad[0],
        images: Array.isArray(images) ? images.map((img: any) => img.image_url) : [],
        comments: comments || [],
      }

      return [adWithDetails]
    } catch (queryError) {
      console.error("Błąd podczas wykonywania zapytania:", queryError)
      if (connection) await connection.end()
      return [mockAdDetails]
    }
  } catch (error) {
    console.error("Błąd podczas pobierania szczegółów ogłoszenia:", error)
    return [mockAdDetails]
  }
}

// Mock data dla szczegółów ogłoszenia
export const mockAdDetails = {
  id: 1,
  title: "Mieszkanie na sprzedaż, 3 pokoje, 60m²",
  description:
    "Przestronne mieszkanie w centrum miasta z widokiem na park. Idealne dla rodziny lub pod inwestycję. Mieszkanie składa się z trzech pokoi, kuchni, łazienki i przedpokoju. Okna wychodzą na południe, co zapewnia dużo światła przez cały dzień. Blisko komunikacji miejskiej, szkół i sklepów.",
  price: 450000,
  location: "Warszawa, Mokotów",
  category: "Nieruchomości",
  subcategory: "Mieszkania",
  created_at: "2023-09-15T12:00:00Z",
  views: 120,
  promoted: true,
  author_name: "Biuro Nieruchomości XYZ",
  author_type: "business",
  author_verified: true,
  author_email: "kontakt@biuroxyz.pl",
  author_phone: "+48 123 456 789",
  author_avatar: "/placeholder.svg?height=100&width=100",
  images: [
    "/placeholder.svg?height=600&width=800&text=Mieszkanie+1",
    "/placeholder.svg?height=600&width=800&text=Mieszkanie+2",
    "/placeholder.svg?height=600&width=800&text=Mieszkanie+3",
  ],
  comments: [
    {
      id: 1,
      ad_id: 1,
      user_id: 2,
      content: "Czy mieszkanie ma balkon?",
      created_at: "2023-09-16T10:30:00Z",
      author_name: "Anna Nowak",
      author_avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      ad_id: 1,
      user_id: 3,
      content: "Jaka jest wysokość czynszu?",
      created_at: "2023-09-16T14:45:00Z",
      author_name: "Piotr Kowalski",
      author_avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      ad_id: 1,
      user_id: 1,
      content: "Tak, mieszkanie posiada balkon o powierzchni 6m². Czynsz wynosi 450 zł miesięcznie.",
      created_at: "2023-09-16T15:20:00Z",
      author_name: "Biuro Nieruchomości XYZ",
      author_avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
}

// Funkcja do pobierania szczegółów firmy z bazy danych
export async function getCompanyDetailsFromDatabase(id: number) {
  if (!isServer) {
    console.log("Używam mock data dla szczegółów firmy (klient)")
    return mockCompanyDetails
  }

  try {
    const company = await query(
      "SELECT u.*, COUNT(r.id) as review_count, AVG(r.rating) as rating FROM users u LEFT JOIN reviews r ON u.id = r.business_id WHERE u.id = ? AND u.type = 'business'",
      [id],
    )

    if (!company || (Array.isArray(company) && company.length === 0)) {
      return mockCompanyDetails
    }

    // Pobierz opinie o firmie
    const reviews = await query(
      "SELECT r.*, u.name as author_name, u.avatar as author_avatar FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.business_id = ? ORDER BY r.created_at DESC",
      [id],
    )

    // Pobierz ogłoszenia firmy
    const ads = await query(
      "SELECT a.* FROM ads a WHERE a.user_id = ? AND a.active = 1 ORDER BY a.created_at DESC LIMIT 5",
      [id],
    )

    return {
      ...company[0],
      reviews: reviews || [],
      ads: ads || [],
    }
  } catch (error) {
    console.error("Błąd podczas pobierania szczegółów firmy:", error)
    return mockCompanyDetails
  }
}

// Mock data dla szczegółów firmy
export const mockCompanyDetails = {
  id: 1,
  name: "Biuro Nieruchomości XYZ",
  description:
    "Profesjonalne biuro nieruchomości z wieloletnim doświadczeniem. Oferujemy kompleksową obsługę w zakresie sprzedaży, kupna i wynajmu nieruchomości.",
  type: "business",
  verified: true,
  avatar: "/placeholder.svg?height=100&width=100",
  location: "Warszawa, Mazowieckie",
  created_at: "2022-01-15T10:00:00Z",
  review_count: 24,
  rating: 4.7,
  email: "kontakt@biuroxyz.pl",
  phone: "+48 123 456 789",
  website: "https://biuroxyz.pl",
  reviews: [
    {
      id: 1,
      business_id: 1,
      user_id: 2,
      rating: 5,
      content: "Świetna obsługa, profesjonalne podejście do klienta. Polecam!",
      created_at: "2023-05-10T14:30:00Z",
      author_name: "Anna Nowak",
      author_avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      business_id: 1,
      user_id: 3,
      rating: 4,
      content: "Dobra firma, szybko znaleźli dla mnie mieszkanie.",
      created_at: "2023-04-20T09:15:00Z",
      author_name: "Piotr Kowalski",
      author_avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
  ads: [
    {
      id: 1,
      title: "Mieszkanie na sprzedaż, 3 pokoje, 60m²",
      description: "Przestronne mieszkanie w centrum miasta z widokiem na park.",
      price: 450000,
      location: "Warszawa, Mokotów",
      category: "Nieruchomości",
      subcategory: "Mieszkania",
      image_url: "/placeholder.svg?height=200&width=300",
      created_at: "2023-09-15T12:00:00Z",
      views: 120,
      promoted: true,
    },
    {
      id: 5,
      title: "Dom na sprzedaż, 5 pokoi, 150m²",
      description: "Piękny dom jednorodzinny z ogrodem w spokojnej okolicy.",
      price: 950000,
      location: "Warszawa, Wilanów",
      category: "Nieruchomości",
      subcategory: "Domy",
      image_url: "/placeholder.svg?height=200&width=300",
      created_at: "2023-09-10T10:00:00Z",
      views: 85,
      promoted: true,
    },
  ],
}

