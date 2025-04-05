"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Search, User, Menu, Plus, Building, MessageSquare } from "lucide-react"
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
import { LogoutButton } from "./logout-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/lib/user-context"
import { NotificationsPanel } from "./notification-panel"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useUser()

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
      href: "/aktualnosci",
      label: "Aktualności",
      icon: <MessageSquare className="h-5 w-5" />,
      active: pathname === "/aktualnosci",
    },
    {
      href: "/firmy",
      label: "Katalog firm",
      icon: <Building className="h-5 w-5" />,
      active: pathname === "/firmy" || pathname.startsWith("/firmy/"),
    },
    {
      href: "/profil",
      label: "Profil",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/profil",
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
            .filter((route) => !route.authRequired || user)
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

        {isLoading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : user ? (
          <div className="flex items-center gap-1">
            {/* Komponent powiadomień */}
            <NotificationsPanel />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user.avatar ||
                        `/placeholder.svg?height=40&width=40&text=${user.name.substring(0, 2).toUpperCase()}`
                      }
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href={`/profil/${user.id}`}>
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
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton variant="ghost" showIcon={true} className="w-full justify-start" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Zaloguj
              </Button>
            </Link>
            <Link href="/register">
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
                {user && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          user.avatar ||
                          `/placeholder.svg?height=40&width=40&text=${user.name.substring(0, 2).toUpperCase()}`
                        }
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <Link href={`/profil/${user.id}`} className="text-sm text-primary">
                        Zobacz profil
                      </Link>
                    </div>
                  </div>
                )}

                <nav className="space-y-1">
                  {routes
                    .filter((route) => !route.authRequired || user)
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

              {!user && !isLoading && (
                <div className="border-t p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Zaloguj
                      </Button>
                    </Link>
                    <Link href="/register">
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

