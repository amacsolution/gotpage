import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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
  "/api/auth/me",
  "/api/ads",
  "/api/users",
  "/api/admin/verify",
  "/api/admin/login",
  "/api/admin/check",
  "/api/admin/users",
  "/api/admin/notifications/send",
]

// Ścieżka do zdjęć ogłoszeń
const adImagesPath = "/adimages/"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Debugowanie - zapisz ścieżkę i ciasteczka w konsoli
  console.log(`Middleware processing path: ${pathname}`)
  console.log(
    "Cookies:",
    request.cookies.getAll().map((c) => `${c.name}=${c.value}`),
  )

  // 1. Obsługa panelu administracyjnego
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    console.log("Checking admin authentication")
    const token = request.cookies.get("admin_token")
    console.log("Admin token:", token)

    // Jeśli nie ma tokenu, przekieruj do logowania
    if (!token || token.value !== "authenticated") {
      console.log("Admin token missing or invalid, redirecting to login")
      const url = new URL("/admin/login", request.url)
      return NextResponse.redirect(url)
    }

    console.log("Admin token valid, proceeding")
  }

  // 2. Zezwól na dostęp do zdjęć ogłoszeń bez autentykacji
  if (pathname.startsWith(adImagesPath)) {
    return NextResponse.next()
  }

  // 3. Sprawdź czy ścieżka jest publiczna
  const isPublicPath =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    publicApiRoutes.some((route) => pathname === route || pathname.startsWith(route)) ||
    pathname.includes("/_next") ||
    pathname.includes("/favicon.ico") ||
    pathname.includes("/public")

  if (isPublicPath) {
    console.log(`Path ${pathname} is public, proceeding`)
    return NextResponse.next()
  }

  // 4. Dla pozostałych ścieżek, kontynuuj (uwierzytelnianie użytkowników jest obsługiwane przez @/lib/auth)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)", "/admin/:path*"],
}

