import mysql from "mysql2/promise"

// Konfiguracja połączenia z bazą danych
export async function createConnection() {
try {
  console.log("Próba połączenia z bazą danych...")
  console.log("Host:", process.env.DB_HOST)
  console.log("Użytkownik:", process.env.DB_USER)
  console.log("Baza danych:", process.env.DB_NAME)
  console.log("Port:", process.env.DB_PORT || 3306)
  console.log("SSL:", process.env.DB_SSL === "true" ? "Włączone" : "Wyłączone")

  // Opcje połączenia
  const connectionOptions: mysql.ConnectionOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    connectTimeout: 10000, // 10 sekund
  }

  // Dodaj opcje SSL tylko jeśli jest włączone
  if (process.env.DB_SSL === "true") {
    console.log("Używam połączenia SSL")
    connectionOptions.ssl = {}
  }

  const connection = await mysql.createConnection(connectionOptions)

  console.log("Połączenie z bazą danych ustanowione pomyślnie")
  return connection
} catch (error) {
  console.error("Błąd połączenia z bazą danych:", error)
  throw error
}
}

// Funkcja do wykonywania zapytań SQL
export async function query(sql: string, params: any[] = []) {
let connection
try {
  connection = await createConnection()
  console.log("Wykonywanie zapytania:", sql)
  console.log("Parametry:", params)

  const [results] = await connection.execute(sql, params)
  return results
} catch (error) {
  console.error("Błąd wykonania zapytania:", error)
  throw error
} finally {
  if (connection) {
    try {
      await connection.end()
      console.log("Połączenie z bazą danych zamknięte")
    } catch (closeError) {
      console.error("Błąd podczas zamykania połączenia:", closeError)
    }
  }
}
}

// Funkcja do pobierania użytkownika po ID
export async function getUserById(id: number) {
try {
  return await query("SELECT * FROM users WHERE id = ?", [id])
} catch (error) {
  console.error("Błąd podczas pobierania użytkownika:", error)
  return []
}
}

// Funkcja do pobierania ogłoszeń
export async function getAds(limit = 10, offset = 0, filters: any = {}) {
try {
  let sql = "SELECT * FROM ads WHERE active = 1"
  const params: any[] = []

  if (filters.category) {
    sql += " AND category = ?"
    params.push(filters.category)
  }

  if (filters.search) {
    sql += " AND (title LIKE ? OR description LIKE ?)"
    params.push(`%${filters.search}%`, `%${filters.search}%`)
  }

  if (filters.minPrice) {
    sql += " AND price >= ?"
    params.push(filters.minPrice)
  }

  if (filters.maxPrice) {
    sql += " AND price <= ?"
    params.push(filters.maxPrice)
  }

  sql += " ORDER BY promoted DESC, created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
} catch (error) {
  console.error("Błąd podczas pobierania ogłoszeń:", error)
  return []
}
}

// Funkcja do pobierania ogłoszenia po ID
export async function getAdById(id: number) {
try {
  return await query(
    "SELECT a.*, u.name as author_name, u.type as author_type, u.verified as author_verified FROM ads a JOIN users u ON a.user_id = u.id WHERE a.id = ?",
    [id],
  )
} catch (error) {
  console.error("Błąd podczas pobierania ogłoszenia:", error)
  return []
}
}

// Funkcja do tworzenia ogłoszenia
export async function createAd(adData: any) {
try {
  return await query(
    "INSERT INTO ads (user_id, title, description, category, subcategory, price, promoted, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
    [adData.userId, adData.title, adData.content, adData.category, adData.subcategory, adData.price, adData.promoted],
  )
} catch (error) {
  console.error("Błąd podczas tworzenia ogłoszenia:", error)
  throw error
}
}

// Funkcja do pobierania użytkownika po email
export async function getUserByEmail(email: string) {
try {
  return await query("SELECT * FROM users WHERE email = ?", [email])
} catch (error) {
  console.error("Błąd podczas pobierania użytkownika:", error)
  return []
}
}

// Funkcja do tworzenia użytkownika
export async function createUser(userData: any) {
try {
  return await query(
    "INSERT INTO users (name, email, password, type, bio, phone, nip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
    [
      userData.name,
      userData.email,
      userData.password,
      userData.type || "individual",
      userData.bio || null,
      userData.phone || null,
      userData.nip || null,
    ],
  )
} catch (error) {
  console.error("Błąd podczas tworzenia użytkownika:", error)
  throw error
}
}