"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Search, Bell, User, Menu, Plus, Building, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Mock data dla zalogowanego użytkownika
const mockUser = {
  isLoggedIn: true,
  name: "Jan Kowalski",
  avatar: "/placeholder.svg?height=40&width=40",
  notifications: 3,
}

export function MainNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const routes = [
    {
      href: "/",
      label: "Strona główna",
      icon: <Home className="h-5 w-5" />,
      active: pathname === "/",
    },
    {
      href: "/ogloszenia",
      label: "Ogłoszenia",
      icon: <Search className="h-5 w-5" />,
      active: pathname === "/ogloszenia" || pathname.startsWith("/ogloszenia/"),
    },
    {
      href: "/firmy",
      label: "Katalog firm",
      icon: <Building className="h-5 w-5" />,
      active: pathname === "/firmy" || pathname.startsWith("/firmy/"),
    },
    {
      href: "/powiadomienia",
      label: "Powiadomienia",
      icon: <Bell className="h-5 w-5" />,
      active: pathname === "/powiadomienia",
      badge: mockUser.isLoggedIn ? mockUser.notifications : 0,
    },
    {
      href: "/profil",
      label: "Profil",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/profil" || pathname.startsWith("/profil/"),
      authRequired: true,
    },
  ]

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="/logo.png" alt="Gotpage Logo" width={32} height={32} className="h-8 w-auto" />
          <span className="font-bold text-xl hidden sm:inline-block">Gotpage</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {routes
            .filter((route) => !route.authRequired || mockUser.isLoggedIn)
            .map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
                {route.badge ? (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {route.badge}
                  </span>
                ) : null}
              </Link>
            ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/ogloszenia/dodaj" className="hidden sm:flex">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Dodaj ogłoszenie</span>
          </Button>
        </Link>

        {mockUser.isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback>{mockUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profil">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ogloszenia/moje">
                    <Search className="mr-2 h-4 w-4" />
                    <span>Moje ogłoszenia</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/powiadomienia">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Powiadomienia</span>
                    {mockUser.notifications > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {mockUser.notifications}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/auth/logout">
                  <LogIn className="mr-2 h-4 w-4 rotate-180" />
                  <span>Wyloguj się</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Zaloguj
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Zarejestruj</Button>
            </Link>
          </div>
        )}

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[350px] pr-0">
            <div className="flex flex-col h-full">
              <div className="flex-1 py-4">
                {mockUser.isLoggedIn && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                      <AvatarFallback>{mockUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mockUser.name}</p>
                      <Link href="/profil" className="text-sm text-primary">
                        Zobacz profil
                      </Link>
                    </div>
                  </div>
                )}

                <nav className="space-y-1">
                  {routes
                    .filter((route) => !route.authRequired || mockUser.isLoggedIn)
                    .map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted rounded-lg",
                          route.active ? "bg-muted text-primary" : "text-foreground",
                        )}
                      >
                        {route.icon}
                        {route.label}
                        {route.badge ? (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {route.badge}
                          </span>
                        ) : null}
                      </Link>
                    ))}

                  <Link
                    href="/ogloszenia/dodaj"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted rounded-lg text-primary"
                  >
                    <Plus className="h-5 w-5" />
                    Dodaj ogłoszenie
                  </Link>
                </nav>
              </div>

              {!mockUser.isLoggedIn && (
                <div className="border-t p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">
                        Zaloguj
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full">Zarejestruj</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

