import mysql from "mysql2/promise"

// Konfiguracja połączenia z bazą danych CyberFolks
export async function createCyberFolksConnection() {
  try {
    console.log("Próba połączenia z bazą danych CyberFolks...")
    console.log("Host:", process.env.DB_HOST)
    console.log("Użytkownik:", process.env.DB_USER)
    console.log("Baza danych:", process.env.DB_NAME)
    console.log("SSL:", process.env.DB_SSL === "true" ? "włączone" : "wyłączone")

    // Opcje połączenia
    const connectionOptions: mysql.ConnectionOptions = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
      connectTimeout: 10000, // 10 sekund
      debug: process.env.NODE_ENV !== "production",
    }

    // Dodaj opcje SSL tylko jeśli jest włączone
    if (process.env.DB_SSL === "true") {
      connectionOptions.ssl = {}
    }

    const connection = await mysql.createConnection(connectionOptions)

    console.log("Połączenie z bazą danych CyberFolks ustanowione pomyślnie")
    return connection
  } catch (error) {
    console.error("Błąd połączenia z bazą danych CyberFolks:", error)
    throw new Error("Nie można połączyć się z bazą danych CyberFolks")
  }
}

// Funkcja do wykonywania zapytań SQL na serwerze CyberFolks
export async function queryCyberFolks(sql: string, params: any[] = []) {
  let connection
  try {
    connection = await createCyberFolksConnection()
    console.log("Wykonywanie zapytania na serwerze CyberFolks:", sql)
    console.log("Parametry:", params)

    const [results] = await connection.execute(sql, params)
    return results
  } catch (error) {
    console.error("Błąd wykonania zapytania na serwerze CyberFolks:", error)
    throw error
  } finally {
    if (connection) {
      try {
        await connection.end()
        console.log("Połączenie z bazą danych CyberFolks zamknięte")
      } catch (closeError) {
        console.error("Błąd podczas zamykania połączenia:", closeError)
      }
    }
  }
}

