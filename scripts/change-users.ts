import * as mysql from "mysql2/promise"

export interface AdData {
    id: number
    title: string
    description: string
    price: number
    currency: string
    location: string
    category: string
    subcategory: string | null
    finalcategory: string | null
    image: string | string[] | null
    createdAt: string
    promoted: number
    likes: number
    views: number
    author_id: number
    author_name: string
    author_avatar: string | null
    author_type: string
    author_verified: number
    author_email: string
    author_phone: string
    author_joined_at: string
    comments_count: number
    parameters: string | null
    ad_key: string
    created_at: string
    updated_at: string
    slug: string | null
    coordinates: {
        lat: string
        lng: string
    }
}

// Konfiguracja połączenia z bazą danych
export async function createConnection() {
    try {
        // Opcje połączenia
        const connectionOptions: mysql.ConnectionOptions = {
            host: "s11.cyber-folks.pl",
            user: "biycgepwzk_backend",
            password: "UcHxI5R-8%RH-jv!",
            database: "biycgepwzk_gotpage",
            port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
            connectTimeout: 10000, // 10 sekund
        }

        // // Log connection options for debugging (do not log passwords in production)
        // console.log("Connecting to MySQL with options:", {
        //     host: connectionOptions.host,
        //     user: connectionOptions.user,
        //     database: connectionOptions.database,
        //     port: connectionOptions.port,
        //     ssl: process.env.DB_SSL
        // });

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

async function query(sql: string, params: any[] = []) {
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

const users: string[] = [
    "ala-58e9e4",
    "kasiulex25-14a59d",
    "patinvest-sp.-z-o.o.-217d58",
    "izabelka123-de5c27",
    "anna-steinbrecher-9dd156",
    "dav&emi-f1d6ff",
    "angelofwest-dd18c7",
    "elektronika-4f4e72",
    "daw&emi-5077be",
    "aneta-rogowska-490d71",
    "lucy2003-9e4a4a",
    "beata-f9fae5",
    "majka95-ee2311",
    "wiktoria-77c330",
    "antoni-675e18",
    "klaudynka-83e1d6",
    "niusia03-23c592",
    "eazymut-10ddbe",
    "poddębice-aeb53b",
    "konrad-miku-0b1f83",
    "marlena-rito-95cd9f",
    "pioart-b1aed5",
    "antoni-6242a6",
    "rafal34s-c4295f",
    "klaudia20d-83ef09",
    "anna-fa51d4"
];


export default async function change() {
    const ads = await query('SELECT id FROM ads WHERE user_id = "anna-fa51d4" LIMIT 20') as AdData[];

    let randomIndex = Math.floor(Math.random() * 26);
    ads.map(ad => {
        randomIndex = Math.floor(Math.random() * 26);
        const user = users[randomIndex];
        console.log(`Changing user for ad ID ${ad.id} to ${user}`);
        return query('UPDATE ads SET user_id = ? WHERE id = ?', [user, ad.id]);

    })
    console.log("Job done", ads)
}


change()