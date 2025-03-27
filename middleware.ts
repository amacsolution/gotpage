import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

// Trasy, które nie wymagają autentykacji
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/",
  "/ogloszenia",
  "/_next",
  "/favicon.ico",
  "/public",
]

// Trasy API, które nie wymagają autentykacji
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/ads",
  "/api/users",
  "/api/admin/verify", // Dodajemy endpoint weryfikacji hasła admina do publicznych tras
]

// Ścieżka do zdjęć ogłoszeń
const adImagesPath = "/adimages/"

// Funkcja pomocnicza do weryfikacji tokena JWT
function verifyJWT(token: string, secret: string) {
  try {
    jwt.verify(token, secret)
    return true
  } catch (error) {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const jwtSecret = process.env.JWT_SECRET || "fallback-secret"

  // 1. Obsługa panelu administracyjnego
  if (pathname.startsWith("/admin")) {
    // Strona logowania do panelu admina jest dostępna bez tokena
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next()
    }

    // Sprawdź token administratora
    const adminToken = request.cookies.get("adminToken")?.value

    if (!adminToken || !verifyJWT(adminToken, jwtSecret)) {
      // Brak tokena lub nieprawidłowy token - przekieruj do logowania
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Token jest prawidłowy - kontynuuj
    return NextResponse.next()
  }

  // 2. Zezwól na dostęp do zdjęć ogłoszeń bez autentykacji
  if (pathname.startsWith(adImagesPath)) {
    return NextResponse.next()
  }

  // 3. Sprawdź czy ścieżka jest publiczna
  const isPublicPath =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    publicApiRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.includes("/_next") || // Statyczne zasoby
    pathname.includes("/favicon.ico") || // Favicon
    pathname.includes("/public") // Publiczne zasoby

  if (isPublicPath) {
    return NextResponse.next()
  }

  // 4. Dla pozostałych ścieżek sprawdź token użytkownika
  //const authToken = request.cookies.get("auth_token")?.value

  // if (!authToken || !verifyJWT(authToken, jwtSecret)) {
  //   // Brak tokena lub nieprawidłowy token - przekieruj do logowania
  //   const url = new URL("/login", request.url)
  //   url.searchParams.set("callbackUrl", encodeURI(request.url))
  //   return NextResponse.redirect(url)
  // }

  // 5. Token jest prawidłowy - kontynuuj
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}

