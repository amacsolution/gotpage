import mysql from "mysql2/promise"
import dotenv from "dotenv"

// Załaduj zmienne środowiskowe z pliku .env
dotenv?.config()

async function testConnection() {


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

    // Próba połączenia
    const connection = await mysql.createConnection(connectionOptions)

    // Sprawdź, czy możemy wykonać proste zapytanie

    const [result] = await connection.execute("SELECT 1 as test")

    // Sprawdź, czy tabele istnieją

    const [tables] = await connection.execute("SHOW TABLES")

    // Zamknij połączenie
    await connection.end()
  } catch (error) {
    console.error("\n❌ Błąd podczas połączenia z bazą danych:")
    console.error(error)

    // Dodatkowe informacje diagnostyczne
    if (error instanceof Error) {

      // Sprawdź typowe problemy
      if (error.message.includes("ECONNREFUSED")) {
      } else if (error.message.includes("ER_ACCESS_DENIED_ERROR")) {

      } else if (error.message.includes("ER_BAD_DB_ERROR")) {

      } else if (error.message.includes("ETIMEDOUT")) {

      } else if (error.message.includes("SSL")) {

      }
    }
  }
}

// Uruchom test
testConnection()

