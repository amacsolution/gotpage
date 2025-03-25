import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const adId = Number.parseInt(params.id)

    if (isNaN(adId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID ogłoszenia" }, { status: 400 })
    }

    // Zwiększenie licznika wyświetleń
    await query("UPDATE ads SET views = views + 1 WHERE id = ?", [adId])

    // Pobranie danych ogłoszenia
    const ads = await query(
      `SELECT 
        a.*,
        u.id as author_id, 
        u.name as author_name, 
        u.email as author_email,
        u.phone as author_phone,
        u.avatar as author_avatar, 
        u.type as author_type,  
        u.verified as author_verified,
        u.created_at as author_joined_at
      FROM ads a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [adId],
    )

    if (!Array.isArray(ads) || ads.length === 0) {
      return NextResponse.json({ error: "Ogłoszenie nie zostało znalezione" }, { status: 404 })
    }

    const ad = ads[0]

    // Pobranie komentarzy do ogłoszenia
    const comments = await query(
      `SELECT 
        c.id, 
        c.content, 
        c.created_at,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar
      FROM ad_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ad_id = ?
      ORDER BY c.created_at DESC`,
      [adId],
    )

    let images = []
    images = await query("SELECT image_url FROM `ad_images` where ad_id = ? ORDER BY `ad_images`.`id` ASC", [adId])

    // Sprawdzenie, czy zalogowany użytkownik polubił to ogłoszenie
    const user = await auth(request)
    let isLiked = false

    if (user) {
      const likeResult = await query("SELECT * FROM ad_likes WHERE user_id = ? AND ad_id = ?", [user.id, adId])
      isLiked = Array.isArray(likeResult) && likeResult.length > 0
    }

    // Bezpieczne parsowanie pola images
    
    /*if (ad.images) {
      try {
        // Próba parsowania jako JSON
        images = JSON.parse(ad.images)
      } catch (e) {
        // Jeśli nie jest prawidłowym JSON, traktuj jako pojedynczy string
        images = [ad.images]
      }
    }*/

    // Bezpieczne parsowanie pola parameters
    let parameters = []
    if (ad.parameters) {
      try {
        // Próba parsowania jako JSON
        parameters = JSON.parse(ad.parameters)
      } catch (e) {
        // Jeśli nie jest prawidłowym JSON, ustaw puste parametry
        parameters = [e]
      }
    }

    // Formatowanie danych
    const formattedAd = {
      ...ad,
      images,
      parameters,
      author: {
        id: ad.author_id,
        name: ad.author_name,
        email: ad.author_email,
        phone: ad.author_phone,
        avatar: ad.author_avatar,
        type: ad.author_type,
        verified: ad.author_verified === 1,
        joinedAt: ad.author_joined_at,
      },
      comments: Array.isArray(comments)
        ? comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            author: {
              id: comment.author_id,
              name: comment.author_name,
              avatar: comment.author_avatar,
            },
            isAuthor: comment.author_id === ad.author_id,
          }))
        : [],
      isLiked,
    }

    return NextResponse.json(formattedAd)
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania ogłoszenia" }, { status: 500 })
  }
}

