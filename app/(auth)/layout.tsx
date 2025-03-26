import type React from "react"
import Link from "next/link"
import { Card, CardHeader } from "@/components/ui/card"
import Image from "next/legacy/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/">
            <div className="inline-flex align-center gap-5 justify-center mb-4">
              <Image src="/logo.png" alt="Gotpage Logo" width={60} height={60} className="h-12 w-auto" />
              <span className="font-bold text-5xl hidden sm:inline-block">Gotpage</span>
            </div>
          </Link>
          {children}
        </CardHeader>
      </Card>
    </div>
  )
}

 