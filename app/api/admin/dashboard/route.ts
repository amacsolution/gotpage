import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// Define types for query results
type UserStats = { total: number; today: number };
type AdsStats = { total: number; today: number };
type CommentsStats = { total: number; today: number };
type ReportsStats = { total: number; pending: number; today: number };
type RecentActivityItem = {
  type: string;
  action: string;
  user: string | null;
  title: string | null;
  target: string | null;
  time: string;
};
type usersStats = {
  total: number;
  today: number;}

// Funkcja pomocnicza do sprawdzania uwierzytelnienia administratora
async function isAdmin(request: NextRequest) {
  const adminToken = (await cookies()).get("admin_token")
  return adminToken && adminToken.value === "authenticated"
}

export async function GET(request: NextRequest) {
  try {
    // Sprawdź, czy użytkownik jest administratorem
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    // Pobierz parametry zapytania
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all" // all, today, week, month

    // Przygotuj warunki dla zapytań w zależności od wybranego okresu
    let dateCondition = ""
    if (period === "today") {
      dateCondition = "WHERE DATE(created_at) = CURDATE()"
    } else if (period === "week") {
      dateCondition = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    } else if (period === "month") {
      dateCondition = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    }

    // Pobierz statystyki użytkowników
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
      FROM users
      ${period !== "all" ? dateCondition : ""}
    `
    const [usersStats]= await db.query(usersQuery)

    // Pobierz statystyki ogłoszeń
    const adsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
        FROM ads
      ${period !== "all" ? dateCondition : ""}
    `
    const [adsStats] = await db.query(adsQuery)

    // Pobierz statystyki komentarzy
    const commentsQuery = `
    SELECT 
    (SELECT COUNT(*) FROM ad_comments) + (SELECT COUNT(*) FROM news_comments) AS total,
    (SELECT COUNT(*) FROM ad_comments WHERE DATE(created_at) = CURDATE()) + 
    (SELECT COUNT(*) FROM news_comments WHERE DATE(created_at) = CURDATE()) AS today
      ${period !== "all" ? dateCondition : ""}
    `
    const [commentsStats] = await db.query(commentsQuery)

    // Pobierz statystyki zgłoszeń
    const reportsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
      FROM reports
      ${period !== "all" ? dateCondition : ""}
    `
    const [reportsStats] = await db.query(reportsQuery)

    // Pobierz ostatnią aktywność
    const recentActivityQuery = `
(SELECT 
    'user' as type,
    'registered' as action,
    u.name as user,
    NULL as title,
    NULL as target,
    u.created_at as time
FROM users u
ORDER BY u.created_at DESC
LIMIT 5)

UNION ALL

(SELECT 
    'ad' as type,
    'created' as action,
    u.name as user,
    a.title as title,
    NULL as target,
    a.created_at as time
FROM ads a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 5)

UNION ALL

(SELECT 
    'report' as type,
    'submitted' as action,
    u.name as user,
    NULL as title,
    CASE 
        WHEN r.reported_type = 'ad' THEN CONCAT('Ogłoszenie #', r.reported_id) 
        WHEN r.reported_type = 'comment' THEN CONCAT('Komentarz #', r.reported_id) 
        WHEN r.reported_type = 'user' THEN CONCAT('Użytkownik #', r.reported_id) 
        ELSE CONCAT(r.reported_type, ' #', r.reported_id) 
    END as target,
    r.created_at as time
FROM reports r
JOIN users u ON r.reporter_id = u.id
ORDER BY r.created_at DESC
LIMIT 5)

UNION ALL

(SELECT 
    'comment' as type,
    'added' as action,
    u.name as user,
    a.title as title,
    NULL as target,
    c.created_at as time
FROM ad_comments c
JOIN users u ON c.user_id = u.id
JOIN ads a ON c.ad_id = a.id
ORDER BY c.created_at DESC
LIMIT 5)

UNION ALL

(SELECT 
    'comment' as type,
    'added' as action,
    u.name as user,
    np.content as title,
    NULL as target,
    c.created_at as time
FROM news_comments c
JOIN users u ON c.user_id = u.id
JOIN news_posts np ON c.post_id = np.id
ORDER BY c.created_at DESC
LIMIT 5)


ORDER BY time DESC
LIMIT 10;

    `

    const [recentActivity] = await db.query(recentActivityQuery) as [RecentActivityItem[]];

    // Przygotuj dane do odpowiedzi
    const dashboardData = {
      stats: {
        users: {
          total: usersStats[0].total ,
          today: usersStats[0].today || 0 ,
        },
        ads: {
          total: adsStats[0].total ,
          today: adsStats[0].today || 0 ,
        },
        comments: {
          total: commentsStats[0].total,
          today: commentsStats[0].today || 0,
        },
        reports: {
          total: reportsStats[0].total,
          pending: reportsStats[0].pending || 0,
          today: reportsStats[0].today || 0,
        },
      },
      recentActivity: (recentActivity as RecentActivityItem[]).map((item) => ({
        ...item,
        time: item.time, // Zachowaj oryginalny format daty
        timeFormatted: new Date(item.time).toLocaleString("pl-PL"), // Dodaj sformatowaną datę
      })),
    }

    console.log("Dane dashboardu:", dashboardData.stats)

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Błąd podczas pobierania danych dashboardu:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych dashboardu" }, { status: 500 })
  }
}

