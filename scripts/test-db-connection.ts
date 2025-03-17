import mysql from "mysql2/promise"
import dotenv from "dotenv"

// Załaduj zmienne środowiskowe z pliku .env
dotenv.config()

async function testConnection() {
  console.log("=== Test połączenia z bazą danych ===")
  console.log("Dane połączenia:")
  console.log(`Host: ${process.env.DB_HOST}`)
  console.log(`Użytkownik: ${process.env.DB_USER}`)
  console.log(`Baza danych: ${process.env.DB_NAME}`)
  console.log(`Port: ${process.env.DB_PORT || 3306}`)
  console.log(`SSL: ${process.env.DB_SSL === "true" ? "Włączone" : "Wyłączone"}`)
  console.log("\nPróba połączenia...")

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
      console.log("Używam połączenia SSL")
      connectionOptions.ssl = {}
    }

    // Próba połączenia
    const connection = await mysql.createConnection(connectionOptions)
    console.log("\n✅ Połączenie ustanowione pomyślnie!")

    // Sprawdź, czy możemy wykonać proste zapytanie
    console.log("\nPróba wykonania zapytania SELECT 1...")
    const [result] = await connection.execute("SELECT 1 as test")
    console.log(`✅ Zapytanie wykonane pomyślnie. Wynik: ${JSON.stringify(result)}`)

    // Sprawdź, czy tabele istnieją
    console.log("\nSprawdzanie tabel w bazie danych...")
    const [tables] = await connection.execute("SHOW TABLES")
    console.log("Tabele w bazie danych:")
    console.log(tables)

    // Zamknij połączenie
    await connection.end()
    console.log("\n✅ Połączenie zamknięte pomyślnie")
  } catch (error) {
    console.error("\n❌ Błąd podczas połączenia z bazą danych:")
    console.error(error)

    // Dodatkowe informacje diagnostyczne
    if (error instanceof Error) {
      console.log("\nSzczegóły błędu:")
      console.log(`Nazwa błędu: ${error.name}`)
      console.log(`Wiadomość: ${error.message}`)
      console.log(`Stos wywołań: ${error.stack}`)

      // Sprawdź typowe problemy
      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n🔍 Diagnoza: Serwer bazy danych odrzuca połączenie.")
        console.log("Możliwe przyczyny:")
        console.log("1. Serwer MySQL nie jest uruchomiony")
        console.log("2. Nieprawidłowy adres hosta lub port")
        console.log("3. Firewall blokuje połączenie")
        console.log("\nSugestie:")
        console.log("- Sprawdź, czy serwer MySQL jest uruchomiony")
        console.log("- Sprawdź, czy podany host i port są poprawne")
        console.log("- Sprawdź ustawienia firewalla")
      } else if (error.message.includes("ER_ACCESS_DENIED_ERROR")) {
        console.log("\n🔍 Diagnoza: Odmowa dostępu.")
        console.log("Możliwe przyczyny:")
        console.log("1. Nieprawidłowa nazwa użytkownika lub hasło")
        console.log("2. Użytkownik nie ma uprawnień do bazy danych")
        console.log("\nSugestie:")
        console.log("- Sprawdź, czy podana nazwa użytkownika i hasło są poprawne")
        console.log("- Sprawdź, czy użytkownik ma uprawnienia do bazy danych")
      } else if (error.message.includes("ER_BAD_DB_ERROR")) {
        console.log("\n🔍 Diagnoza: Baza danych nie istnieje.")
        console.log("Możliwe przyczyny:")
        console.log("1. Baza danych o podanej nazwie nie istnieje")
        console.log("2. Użytkownik nie ma uprawnień do bazy danych")
        console.log("\nSugestie:")
        console.log("- Sprawdź, czy baza danych o podanej nazwie istnieje")
        console.log("- Utwórz bazę danych, jeśli nie istnieje")
        console.log("- Sprawdź, czy użytkownik ma uprawnienia do bazy danych")
      } else if (error.message.includes("ETIMEDOUT")) {
        console.log("\n🔍 Diagnoza: Przekroczono limit czasu połączenia.")
        console.log("Możliwe przyczyny:")
        console.log("1. Serwer bazy danych jest niedostępny")
        console.log("2. Problemy z siecią")
        console.log("3. Firewall blokuje połączenie")
        console.log("\nSugestie:")
        console.log("- Sprawdź, czy serwer bazy danych jest dostępny")
        console.log("- Sprawdź połączenie sieciowe")
        console.log("- Sprawdź ustawienia firewalla")
      } else if (error.message.includes("SSL")) {
        console.log("\n🔍 Diagnoza: Problem z SSL.")
        console.log("Możliwe przyczyny:")
        console.log("1. Serwer nie obsługuje SSL")
        console.log("2. Nieprawidłowa konfiguracja SSL")
        console.log("\nSugestie:")
        console.log("- Ustaw DB_SSL=false, jeśli serwer nie wymaga SSL")
        console.log("- Sprawdź konfigurację SSL na serwerze")
      }
    }
  }
}

// Uruchom test
testConnection()

