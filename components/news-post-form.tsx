"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface NewsPostFormProps {
  user: {
    id: number
    name: string
    avatar: string
  }
  onPostCreated: (post: any) => void
}

export function NewsPostForm({ user, onPostCreated }: NewsPostFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Błąd",
        description: "Treść wpisu nie może być pusta",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas dodawania wpisu")
      }

      const newPost = await response.json()
      onPostCreated(newPost)
      setContent("")

      toast({
        title: "Sukces",
        description: "Wpis został dodany pomyślnie",
      })
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas dodawania wpisu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6 border-none">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Co słychać?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none p-4"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publikowanie...
                </>
              ) : (
                "Opublikuj"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

