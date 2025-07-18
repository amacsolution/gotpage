import mysql from "mysql2/promise"

// Konfiguracja połączenia z bazą danych
export async function createConnection() {
  try {


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
      connectionOptions.ssl = {}
    }

    const connection = await mysql.createConnection(connectionOptions)

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

    const [results] = await connection.execute(sql, params)
    return results
  } catch (error) {
    console.error("Błąd wykonania zapytania:", error)
    throw error
  } finally {
    if (connection) {
      try {
        await connection.end()
      } catch (closeError) {
        console.error("Błąd podczas zamykania połączenia:", closeError)
      }
    }
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
  ssl:
    process.env.DB_SSL === "true"
      ? {
        rejectUnauthorized: false,
      }
      : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const db = {
  async query(sql: string, params?: any[]) {
    try {
      const [results] = await pool.execute(sql, params)
      return [results, null]
    } catch (error) {
      console.error("Database error:", error)
      return [null, error]
    }
  },

  async transaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const result = await callback(connection)
      await connection.commit()
      return [result, null]
    } catch (error) {
      await connection.rollback()
      console.error("Transaction error:", error)
      return [null, error]
    } finally {
      connection.release()
    }
  },
}

// Funkcja do sprawdzenia połączenia z bazą danych
export async function testConnection() {
  try {
    const [result] = await pool.execute("SELECT 1 as test")
    return { connected: true, result }
  } catch (error) {
    console.error("Database connection error:", error)
    return { connected: false, error }
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

