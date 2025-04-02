"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="relative group">
      <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"))}
      >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Przełącz motyw</span>
      </Button>
      <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-muted text-foreground text-xs rounded py-1 px-2">
      Przełącz Motyw
      </div>
    </div>
  )
}

