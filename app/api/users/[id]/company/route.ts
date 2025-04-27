import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { auth, authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

// Define UserData interface
interface UserData {
  id: number
  name: string
  email: string
  phone: string
  description: string
  bio: string
  avatar: string
  type: string
  verified: boolean
  joinedAt: Date
  location: string
  categories: string
  services: string
  fullname: string
  adress: string
  occupation: string
  interests: string
  website: string
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = (await params).id
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Fetch user data
    const userData = await query(
      `SELECT 
        u.id, 
        u.name, 
        u.fullname,
        u.email, 
        u.phone, 
        u.description, 
        u.bio,
        u.avatar, 
        u.background_img,
        u.type, 
        u.verified, 
        u.created_at as joinedAt, 
        u.location,
        u.adress,
        u.categories,
        u.occupation,
        u.interests,
        u.company_size,
        u.website
      FROM users u 
      WHERE u.id = ?`,
      [userId],
    ) as UserData[]

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userData[0]

    // Parse categories if it's a JSON string
    if (user.categories && typeof user.categories === "string") {
      try {
        user.categories = JSON.parse(user.categories)
      } catch (e) {
        user.categories = []
      }
    } else {
      user.categories = []
    }

    // Fetch business data if user is a business
    if (user.type === "business") {
      const businessData = await query("SELECT nip, regon, krs FROM business_details WHERE user_id = ?", [userId]) as { np: string, regon: string, krs : string}[]

      if (businessData && businessData.length > 0) {
        user.businessData = businessData[0]
      }
    }

    // Fetch user stats
    const adsCount = await query("SELECT COUNT(*) as count FROM ads WHERE user_id = ?", [userId]) as {count : number}[]
    const viewsCount = await query("SELECT SUM(views) as count FROM ads WHERE user_id = ?", [userId]) as {count : number}[]
    const likesCount = await query(
      "SELECT COUNT(*) as count FROM ad_likes WHERE ad_id IN (SELECT id FROM ads WHERE user_id = ?)",
      [userId],
    ) as {count : number}[]
    const reviewsData = await query("SELECT COUNT(*) as count, AVG(rating) as avg FROM reviews WHERE user_id = ?", [
      userId,
    ]) as {count : number}[]
    const followersCount = await query("SELECT COUNT(*) as count FROM user_follows WHERE followed_id = ?", [userId]) as {count : number}[]
    const followingCount = await query("SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?", [userId]) as {count : number}[]

    user.stats = {
      ads: adsCount[0]?.count || 0,
      views: viewsCount[0]?.count || 0,
      likes: likesCount[0]?.count || 0,
      reviews: reviewsData[0]?.count || 0,
      rating: reviewsData[0]?.avg || 0,
      followers: followersCount[0]?.count || 0,
      following: followingCount[0]?.count || 0,
    }

    // Check if current user is following this user
    let isFollowing : boolean = false
    if (currentUserId) {
      const followData = await query("SELECT * FROM user_follows WHERE follower_id = ? AND followed_id = ?", [
        currentUserId,
        userId,
      ]) as any[]
      isFollowing = followData && followData.length > 0
    }
    user.isFollowing = isFollowing

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Sprawdzenie, czy użytkownik próbuje edytować swój własny profil
    const userId = Number.parseInt(params.id)
    if (isNaN(userId) || userId !== user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do edycji tego profilu" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, bio, location, services, fullname, adress, occupation, interests, website } = body

    // Walidacja danych
    if (!name || !email) {
      return NextResponse.json({ error: "Nazwa i email są wymagane" }, { status: 400 })
    }

    // Sprawdzenie, czy email jest już używany przez innego użytkownika
    if (email !== user.email) {
      const existingUsers = await query("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])
      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json({ error: "Ten adres email jest już używany" }, { status: 409 })
      }
    }

    // Walidacja i przetwarzanie usług
    let servicesJson = null
    if (services) {
      try {
        // Jeśli services jest już stringiem JSON, użyj go bezpośrednio
        if (typeof services === "string") {
          // Sprawdź, czy to poprawny JSON
          JSON.parse(services)
          servicesJson = services
        } else if (Array.isArray(services)) {
          // Walidacja struktury usług
          services.forEach((service) => {
            if (!service.name) {
              throw new Error("Każda usługa musi mieć nazwę")
            }
          })
          servicesJson = JSON.stringify(services)
        } else {
          throw new Error("Nieprawidłowy format usług")
        }
      } catch (error: any) {
        return NextResponse.json({ error: "Nieprawidłowy format usług: " + error.message }, { status: 400 })
      }
    }

    // Aktualizacja danych użytkownika
    await query(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, description = ?, location = ?, 
           services = ?, fullname = ?, adress = ?, occupation = ?, 
           interests = ?, website = ?, updated_at = NOW() 
       WHERE id = ?`,
      [
        name,
        email,
        phone || "",
        bio || "",
        location || "",
        servicesJson,
        fullname || "",
        adress || "",
        occupation || "",
        interests || "",
        website || "",
        userId,
      ],
    )

    // Pobranie zaktualizowanych danych
    const updatedUsers = (await query(
      `SELECT 
        id, name, email, phone, description as bio, avatar, type, verified, 
        created_at as joinedAt, location, categories, services, fullname, 
        adress, occupation, interests, website
       FROM users 
       WHERE id = ?`,
      [userId],
    )) as UserData[]

    if (!Array.isArray(updatedUsers) || updatedUsers.length === 0) {
      throw new Error("Nie udało się pobrać zaktualizowanych danych użytkownika")
    }

    const updatedUser = updatedUsers[0]

    // Formatowanie danych
    return NextResponse.json({
      ...updatedUser,
      categories: updatedUser.categories ? JSON.parse(updatedUser.categories) : [],
      services: updatedUser.services ? JSON.parse(updatedUser.services) : [],
    })
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych użytkownika:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji danych użytkownika" }, { status: 500 })
  }
}
