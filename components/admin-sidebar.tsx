"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Flag, Users, MessageSquare, Settings, LogOut, Building } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Usuń ciasteczko z tokenem
      document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/reports", label: "Zgłoszenia", icon: Flag },
    { href: "/admin/users", label: "Użytkownicy", icon: Users },
    { href: "/admin/ads", label: "Ogłoszenia", icon: MessageSquare },
    { href: "/admin/companies", label: "Firmy", icon: Building },
    { href: "/admin/settings", label: "Ustawienia", icon: Settings },
  ]

  return (
    <div className="w-64 min-h-screen bg-background shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-bold">Panel Administratora</h2>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center m-2 rounded-md px-6 py-3 text-foreground hover:bg-muted ${
                      isActive ? "bg-muted" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            )
          })}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center m-2 rounded-md w-full px-6 py-3 text-foreground hover:bg-muted"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Wyloguj</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

