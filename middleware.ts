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
]

// Trasy API, które nie wymagają autentykacji
const publicApiRoutes = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/ads", "/api/users"]

const adImagesPath = "/adimages/"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith(adImagesPath)) {
    // Zezwalamy na dostęp do zdjęć ogłoszeń bez autentykacji
    return NextResponse.next()
  }

  // Sprawdzenie czy trasa jest publiczna
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route))

  // Jeśli trasa jest publiczna, pozwól na dostęp
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Pobranie tokenu z ciasteczka
  const token = request.cookies.get("auth_token")?.value

  // Jeśli nie ma tokenu, przekieruj do strony logowania
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  try {
    // Weryfikacja tokenu
    jwt.verify(token, process.env.JWT_SECRET || "default_secret")
    return NextResponse.next()
  } catch (error) {
    // Jeśli token jest nieprawidłowy, przekieruj do strony logowania
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

