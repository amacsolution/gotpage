import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gotpage",
}

async function seed() {
  console.log("Rozpoczynam wypełnianie bazy danych...")

  try {
    const connection = await mysql.createConnection(dbConfig)

    // Tworzenie tabel
    await createTables(connection)

    // Wypełnianie tabel danymi
    await seedUsers(connection)
    await seedCategories(connection)
    await seedAds(connection)
    await seedAdImages(connection)
    await seedAdComments(connection)
    await seedReviews(connection)

    await connection.end()

    console.log("Baza danych została pomyślnie wypełniona!")
  } catch (error) {
    console.error("Błąd podczas wypełniania bazy danych:", error)
  }
}

async function createTables(connection: mysql.Connection) {
  console.log("Tworzenie tabel...")

  // Tabela users
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      type ENUM('individual', 'business') NOT NULL DEFAULT 'individual',
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      avatar VARCHAR(255),
      phone VARCHAR(20),
      location VARCHAR(255),
      description TEXT,
      website VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela categories
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      parent_id INT,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `)

  // Tabela ads
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
      category VARCHAR(255) NOT NULL,
      subcategory VARCHAR(255),
      location VARCHAR(255) NOT NULL,
      promoted BOOLEAN NOT NULL DEFAULT FALSE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      views INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Tabela ad_images
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ad_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_id INT NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
    )
  `)

  // Tabela ad_comments
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ad_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Tabela reviews
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
}

async function seedUsers(connection: mysql.Connection) {
  console.log("Wypełnianie tabeli users...")

  // Sprawdź, czy tabela jest już wypełniona
  const [rows] = await connection.execute("SELECT COUNT(*) as count FROM users")
  if ((rows as any)[0].count > 0) {
    console.log("Tabela users już zawiera dane, pomijam...")
    return
  }

  // Przykładowi użytkownicy
  const users = [
    {
      name: "Jan Kowalski",
      email: "jan.kowalski@example.com",
      password: "$2a$10$XHCgCVo1OQjfZZfDrUK/3OQJl0B1yrYA.PWZtYEBNQFQBnZN0oKYe", // hasło: password
      type: "individual",
      verified: false,
      avatar: "/placeholder.svg?height=100&width=100",
      phone: "+48 123 456 789",
      location: "Warszawa, Mazowieckie",
      description: "Zwykły użytkownik platformy.",
    },
    {
      name: "Anna Nowak",
      email: "anna.nowak@example.com",
      password: "$2a$10$XHCgCVo1OQjfZZfDrUK/3OQJl0B1yrYA.PWZtYEBNQFQBnZN0oKYe",
      type: "individual",
      verified: false,
      avatar: "/placeholder.svg?height=100&width=100",
      phone: "+48 987 654 321",
      location: "Kraków, Małopolskie",
      description: "Zwykły użytkownik platformy.",
    },
    {
      name: "Biuro Nieruchomości XYZ",
      email: "kontakt@biuroxyz.pl",
      password: "$2a$10$XHCgCVo1OQjfZZfDrUK/3OQJl0B1yrYA.PWZtYEBNQFQBnZN0oKYe",
      type: "business",
      verified: true,
      avatar: "/placeholder.svg?height=100&width=100",
      phone: "+48 111 222 333",
      location: "Warszawa, Mazowieckie",
      description:
        "Profesjonalne biuro nieruchomości z wieloletnim doświadczeniem. Oferujemy kompleksową obsługę w zakresie sprzedaży, kupna i wynajmu nieruchomości.",
      website: "https://biuroxyz.pl",
    },
    {
      name: "Auto Komis Premium",
      email: "kontakt@autokomis.pl",
      password: "$2a$10$XHCgCVo1OQjfZZfDrUK/3OQJl0B1yrYA.PWZtYEBNQFQBnZN0oKYe",
      type: "business",
      verified: true,
      avatar: "/placeholder.svg?height=100&width=100",
      phone: "+48 444 555 666",
      location: "Kraków, Małopolskie",
      description:
        "Największy komis samochodowy w regionie. Oferujemy samochody używane z gwarancją, możliwość finansowania oraz profesjonalny serwis.",
      website: "https://autokomis.pl",
    },
    {
      name: "Sklep iMobile",
      email: "kontakt@imobile.pl",
      password: "$2a$10$XHCgCVo1OQjfZZfDrUK/3OQJl0B1yrYA.PWZtYEBNQFQBnZN0oKYe",
      type: "business",
      verified: true,
      avatar: "/placeholder.svg?height=100&width=100",
      phone: "+48 777 888 999",
      location: "Wrocław, Dolnośląskie",
      description:
        "Autoryzowany sprzedawca telefonów i akcesoriów. Oferujemy najnowsze modele smartfonów, tabletów oraz akcesoria do nich.",
      website: "https://imobile.pl",
    },
  ]

  for (const user of users) {
    await connection.execute(
      "INSERT INTO users (name, email, password, type, verified, avatar, phone, location, description, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user.name,
        user.email,
        user.password,
        user.type,
        user.verified,
        user.avatar,
        user.phone,
        user.location,
        user.description,
        user.website || null,
      ],
    )
  }
}

async function seedCategories(connection: mysql.Connection) {
  console.log("Wypełnianie tabeli categories...")

  // Sprawdź, czy tabela jest już wypełniona
  const [rows] = await connection.execute("SELECT COUNT(*) as count FROM categories")
  if ((rows as any)[0].count > 0) {
    console.log("Tabela categories już zawiera dane, pomijam...")
    return
  }

  // Główne kategorie
  const mainCategories = [
    { name: "Nieruchomości" },
    { name: "Motoryzacja" },
    { name: "Elektronika" },
    { name: "Praca" },
    { name: "Dom i ogród" },
    { name: "Moda" },
    { name: "Sport i hobby" },
    { name: "Dla dzieci" },
    { name: "Zwierzęta" },
    { name: "Usługi" },
  ]

  for (const category of mainCategories) {
    await connection.execute("INSERT INTO categories (name, parent_id) VALUES (?, NULL)", [category.name])
  }

  // Podkategorie
  const subcategories = [
    { name: "Mieszkania", parent: "Nieruchomości" },
    { name: "Domy", parent: "Nieruchomości" },
    { name: "Działki", parent: "Nieruchomości" },
    { name: "Lokale", parent: "Nieruchomości" },
    { name: "Samochody osobowe", parent: "Motoryzacja" },
    { name: "Motocykle", parent: "Motoryzacja" },
    { name: "Części", parent: "Motoryzacja" },
    { name: "Telefony", parent: "Elektronika" },
    { name: "Komputery", parent: "Elektronika" },
    { name: "RTV i AGD", parent: "Elektronika" },
    { name: "Oferty pracy", parent: "Praca" },
    { name: "Szukam pracy", parent: "Praca" },
    { name: "Meble", parent: "Dom i ogród" },
    { name: "Ogród", parent: "Dom i ogród" },
    { name: "Odzież", parent: "Moda" },
    { name: "Obuwie", parent: "Moda" },
    { name: "Rowery", parent: "Sport i hobby" },
    { name: "Sprzęt sportowy", parent: "Sport i hobby" },
    { name: "Zabawki", parent: "Dla dzieci" },
    { name: "Ubranka", parent: "Dla dzieci" },
    { name: "Psy", parent: "Zwierzęta" },
    { name: "Koty", parent: "Zwierzęta" },
    { name: "Budowlane", parent: "Usługi" },
    { name: "Transportowe", parent: "Usługi" },
  ]

  for (const subcategory of subcategories) {
    // Pobierz ID kategorii nadrzędnej
    const [parentRows] = await connection.execute("SELECT id FROM categories WHERE name = ?", [subcategory.parent])

    const parentId = (parentRows as any)[0].id

    await connection.execute("INSERT INTO categories (name, parent_id) VALUES (?, ?)", [subcategory.name, parentId])
  }
}

async function seedAds(connection: mysql.Connection) {
  console.log("Wypełnianie tabeli ads...")

  // Sprawdź, czy tabela jest już wypełniona
  const [rows] = await connection.execute("SELECT COUNT(*) as count FROM ads")
  if ((rows as any)[0].count > 0) {
    console.log("Tabela ads już zawiera dane, pomijam...")
    return
  }

  // Przykładowe ogłoszenia
  const ads = [
    {
      user_id: 3, // Biuro Nieruchomości XYZ
      title: "Mieszkanie na sprzedaż, 3 pokoje, 60m²",
      description:
        "Przestronne mieszkanie w centrum miasta z widokiem na park. Idealne dla rodziny lub pod inwestycję. Mieszkanie składa się z trzech pokoi, kuchni, łazienki i przedpokoju. Okna wychodzą na południe, co zapewnia dużo światła przez cały dzień. Blisko komunikacji miejskiej, szkół i sklepów.",
      price: 450000,
      currency: "PLN",
      category: "Nieruchomości",
      subcategory: "Mieszkania",
      location: "Warszawa, Mokotów",
      promoted: true,
      active: true,
      views: 120,
      created_at: "2023-09-15 12:00:00",
    },
    {
      user_id: 3, // Biuro Nieruchomości XYZ
      title: "Dom na sprzedaż, 5 pokoi, 150m²",
      description:
        "Piękny dom jednorodzinny z ogrodem w spokojnej okolicy. Dom posiada 5 pokoi, 2 łazienki, kuchnię, salon, garaż oraz ogród o powierzchni 500m². Idealny dla rodziny z dziećmi.",
      price: 950000,
      currency: "PLN",
      category: "Nieruchomości",
      subcategory: "Domy",
      location: "Warszawa, Wilanów",
      promoted: true,
      active: true,
      views: 85,
      created_at: "2023-09-10 10:00:00",
    },
    {
      user_id: 4, // Auto Komis Premium
      title: "Samochód osobowy Toyota Corolla 2019",
      description:
        "Toyota Corolla z 2019 roku, przebieg 45000 km, benzyna, stan idealny, pierwszy właściciel. Samochód serwisowany w ASO, bezwypadkowy, z pełną dokumentacją.",
      price: 65000,
      currency: "PLN",
      category: "Motoryzacja",
      subcategory: "Samochody osobowe",
      location: "Kraków, Małopolskie",
      promoted: false,
      active: true,
      views: 85,
      created_at: "2023-09-14 10:30:00",
    },
    {
      user_id: 4, // Auto Komis Premium
      title: "Motocykl Honda CBR 600RR 2020",
      description:
        "Honda CBR 600RR z 2020 roku, przebieg 10000 km, stan idealny, pierwszy właściciel. Motocykl serwisowany w ASO, bezwypadkowy, z pełną dokumentacją.",
      price: 45000,
      currency: "PLN",
      category: "Motoryzacja",
      subcategory: "Motocykle",
      location: "Kraków, Małopolskie",
      promoted: true,
      active: true,
      views: 65,
      created_at: "2023-09-12 14:45:00",
    },
    {
      user_id: 5, // Sklep iMobile
      title: "iPhone 13 Pro, 256GB, gwarancja",
      description:
        "Sprzedam iPhone 13 Pro w idealnym stanie, 256GB pamięci, na gwarancji jeszcze przez rok. Komplet: pudełko, ładowarka, słuchawki, dokumenty.",
      price: 3800,
      currency: "PLN",
      category: "Elektronika",
      subcategory: "Telefony",
      location: "Wrocław, Dolnośląskie",
      promoted: true,
      active: true,
      views: 65,
      created_at: "2023-09-13 15:45:00",
    },
    {
      user_id: 1, // Jan Kowalski
      title: "Rower górski Kross Level 5.0",
      description:
        "Rower górski Kross Level 5.0, rozmiar ramy L, koła 29 cali, hamulce tarczowe, stan bardzo dobry. Używany przez jeden sezon, przebieg około 1000 km.",
      price: 2200,
      currency: "PLN",
      category: "Sport i hobby",
      subcategory: "Rowery",
      location: "Poznań, Wielkopolskie",
      promoted: false,
      active: true,
      views: 42,
      created_at: "2023-09-12 09:15:00",
    },
  ]

  for (const ad of ads) {
    await connection.execute(
      "INSERT INTO ads (user_id, title, description, price, currency, category, subcategory, location, promoted, active, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        ad.user_id,
        ad.title,
        ad.description,
        ad.price,
        ad.currency,
        ad.category,
        ad.subcategory,
        ad.location,
        ad.promoted,
        ad.active,
        ad.views,
        ad.created_at,
      ],
    )
  }
}

async function seedAdImages(connection: mysql.Connection) {
  console.log("Wypełnianie tabeli ad_images...")

  // Sprawdź, czy tabela jest już wypełniona
  const [rows] = await connection.execute("SELECT COUNT(*) as count FROM ad_images")
  if ((rows as any)[0].count > 0) {
    console.log("Tabela ad_images już zawiera dane, pomijam...")
    return
  }

  // Przykładowe zdjęcia ogłoszeń
  const adImages = [
    { ad_id: 1, image_url: "/placeholder.svg?height=600&width=800&text=Mieszkanie+1" },
    { ad_id: 1, image_url: "/placeholder.svg?height=600&width=800&text=Mieszkanie+2" },
    { ad_id: 1, image_url: "/placeholder.svg?height=600&width=800&text=Mieszkanie+3" },
    { ad_id: 2, image_url: "/placeholder.svg?height=600&width=800&text=Dom+1" },
    { ad_id: 2, image_url: "/placeholder.svg?height=600&width=800&text=Dom+2" },
    { ad_id: 2, image_url: "/placeholder.svg?height=600&width=800&text=Dom+3" },
    { ad_id: 3, image_url: "/placeholder.svg?height=600&width=800&text=Toyota+1" },
    { ad_id: 3, image_url: "/placeholder.svg?height=600&width=800&text=Toyota+2" },
    { ad_id: 4, image_url: "/placeholder.svg?height=600&width=800&text=Honda+1" },
    { ad_id: 4, image_url: "/placeholder.svg?height=600&width=800&text=Honda+2" },
    { ad_id: 5, image_url: "/placeholder.svg?height=600&width=800&text=iPhone+1" },
    { ad_id: 5, image_url: "/placeholder.svg?height=600&width=800&text=iPhone+2" },
    { ad_id: 6, image_url: "/placeholder.svg?height=600&width=800&text=Rower+1" },
  ]

  for (const image of adImages) {
    await connection.execute("INSERT INTO ad_images (ad_id, image_url) VALUES (?, ?)", [image.ad_id, image.image_url])
  }
}

async function seedAdComments(connection: mysql.Connection) {
  console.log("Wypełnianie tabeli ad_comments...")

  // Sprawdź, czy tabela jest już wypełniona
  const [rows] = await connection.execute("SELECT COUNT(*) as count FROM ad_comments")
  if ((rows as any)[0].count > 0) {
    console.log("Tabela ad_comments już zawiera dane, pomijam...")
    return
  }

  // Przykładowe komentarze do ogłoszeń
  const adComments = [
    {
      ad_id: 1,
      user_id: 2, // Anna Nowak
      content: "Czy mieszkanie ma balkon?",
      created_at: "2023-09-16 10:30:00",
    },
    {
      ad_id: 1,
      user_id: 1, // Jan Kowalski
      content: "Jaka jest wysokość czynszu?",
      created_at: "2023-09-16 14:45:00",
    },
    {
      ad_id: 1,
      user_id: 3, // Biuro Nieruchomości XYZ
      content: "Tak, mieszkanie posiada balkon o powierzchni 6m². Czynsz wynosi 450 zł miesięcznie.",
      created_at: "2023-09-16 15:20:00",
    },
    {
      ad_id: 3,
      user_id: 1, // Jan Kowalski
      content: "Czy możliwa jest jazda próbna?",
      created_at: "2023-09-15 11:30:00",
    },
    {
      ad_id: 3,
      user_id: 4, // Auto Komis Premium
      content: "Oczywiście, zapraszamy na jazdę próbną po wcześniejszym umówieniu się telefonicznie.",
      created_at: "2023-09-15 12:15:00",
    },
  ]

  for (const comment of adComments) {
    await connection.execute("INSERT INTO ad_comments (ad_id, user_id, content, created_at) VALUES (?, ?, ?, ?)", [
      comment.ad_id,
      comment.user_id,
      comment.content,
      comment.created_at,
    ])
  }
}

async function seedReviews(connection: mysql.Connection) {
  console.log("Wypełnianie tabeli reviews...")

  // Sprawdź, czy tabela jest już wypełniona
  const [rows] = await connection.execute("SELECT COUNT(*) as count FROM reviews")
  if ((rows as any)[0].count > 0) {
    console.log("Tabela reviews już zawiera dane, pomijam...")
    return
  }

  // Przykładowe opinie o firmach
  const reviews = [
    {
      business_id: 3, // Biuro Nieruchomości XYZ
      user_id: 1, // Jan Kowalski
      rating: 5,
      content: "Świetna obsługa, profesjonalne podejście do klienta. Polecam!",
      created_at: "2023-05-10 14:30:00",
    },
    {
      business_id: 3, // Biuro Nieruchomości XYZ
      user_id: 2, // Anna Nowak
      rating: 4,
      content: "Dobra firma, szybko znaleźli dla mnie mieszkanie.",
      created_at: "2023-04-20 09:15:00",
    },
    {
      business_id: 4, // Auto Komis Premium
      user_id: 1, // Jan Kowalski
      rating: 5,
      content: "Profesjonalna obsługa, uczciwe podejście do klienta. Samochód zgodny z opisem.",
      created_at: "2023-06-15 16:45:00",
    },
    {
      business_id: 5, // Sklep iMobile
      user_id: 2, // Anna Nowak
      rating: 5,
      content: "Szybka dostawa, produkt zgodny z opisem. Polecam!",
      created_at: "2023-07-05 11:20:00",
    },
  ]

  for (const review of reviews) {
    await connection.execute(
      "INSERT INTO reviews (business_id, user_id, rating, content, created_at) VALUES (?, ?, ?, ?, ?)",
      [review.business_id, review.user_id, review.rating, review.content, review.created_at],
    )
  }
}

// Uruchomienie skryptu
seed()

