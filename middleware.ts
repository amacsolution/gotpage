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
  "/api/ogloszenia",
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

  // 1. Obsługa panelu administracyjnego
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_token")

    // Jeśli nie ma tokenu, przekieruj do logowania
    if (!token || token.value !== "authenticated") {
      const url = new URL("/admin/login", request.url)
      return NextResponse.redirect(url)
    }
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
    return NextResponse.next()
  }

  // 4. Dla pozostałych ścieżek, kontynuuj (uwierzytelnianie użytkowników jest obsługiwane przez @/lib/auth)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)", "/admin/:path*"],
}

