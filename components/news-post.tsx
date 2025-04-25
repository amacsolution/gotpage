"use client"

import { useState, JSX, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, MessageSquare, Share2, ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, Flag, ShieldCheck, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LinkPreview from "@/components/link-preview"
import { NewsComments } from "@/components/news-comments"
import { useUser } from "@/lib/user-context"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FollowButton } from "./follow-button"

export interface NewsPostProps {
  post: {
    id: number
    content: string
    hasLink: boolean
    linkUrl?: string
    likes: number
    comments: number
    createdAt: string
    isLiked: boolean
    type: "text" | "image" | "poll"
    imageUrl?: string
    pollData?: {
      options: string[]
      votes: number[]
      totalVotes: number
      userVote?: number
    }
    author: {
      id: number
      name: string
      avatar: string
      type: string
      verified: boolean
    }
  }
  onVote: (postId: string, optionId: string) => Promise<void>;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onEditPost: (postId: string, content: string) => Promise<void>;
  onFollow: (userId: string) => Promise<void>;
  showFollowButton: boolean;
}


// Funkcja do sprawdzania, czy tekst zawiera URL - taka sama jak w LinkPreview
const hasUrl = (text: string): boolean => {
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:\d+)?(\/[^\s]*)?)/gi
  return urlRegex.test(text)
}

// Funkcja do formatowania tekstu z pogrubieniem linków - zaktualizowana
export const formatTextWithBoldLinksAndHashtags = (text: string) => {
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:\d+)?(\/[^\s]*)?)/gi
  const hashtagRegex = /#(\w+)/g

  // Zamień linki na <strong> i hashtagi na <span> w tekście
  return text.split(/(\s+)/).map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <strong key={`url-${i}`} className="text-primary">
          <a href={part} target="_blank" rel="noopener noreferrer">
            {part}
            <ExternalLink className="h-4 w-4 inline-block ml-1" />
          </a>
        </strong>
      )
    } else if (hashtagRegex.test(part)) {
      return (
        <span key={`hashtag-${i}`} className="text-muted-foreground text-sm cursor-pointer">
          {part}
        </span>
      )
    }
    return part
  })
}

export function NewsPost({ post }: NewsPostProps) {

  const [isLiked, setIsLiked] = useState(post?.isLiked || false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [pollData, setPollData] = useState(post.pollData || { options: [], votes: [], totalVotes: 0 })
  const [userVote, setUserVote] = useState<number | undefined>(post.pollData?.userVote)
  const { toast } = useToast()
  const { user } = useUser()
  const [isAuthor, setIsAuthor] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const handleLike = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/news/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas przetwarzania polubienia")
      }

      const data = await response.json()

      // Aktualizacja stanu z bazy danych
      setIsLiked(data.liked)
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1))

    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas przetwarzania polubienia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post od ${post.author.name} na Gotpage`,
          text: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
          url: `${window.location.origin}/aktualnosci/post/${post.id}`,
        })
      } catch (error) {
      }
    } else {
      // Fallback dla przeglądarek bez API Web Share
      const url = `${window.location.origin}/aktualnosci/post/${post.id}`
      navigator.clipboard.writeText(url)
      toast({
        title: "Link skopiowany",
        description: "Link do wpisu został skopiowany do schowka",
      })
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  const handleVote = async (optionIndex: number) => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby głosować w ankietach",
        variant: "destructive",
      })
      return
    }

    if (userVote !== undefined) {
      toast({
        title: "Już zagłosowałeś",
        description: "Możesz oddać tylko jeden głos w ankiecie",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/news/${post.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionIndex }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas głosowania")
      }

      const data = await response.json()
      setPollData(data.pollData)
      setUserVote(optionIndex)

      toast({
        title: "Głos oddany",
        description: "Twój głos został zapisany",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas głosowania",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setIsAuthor(user.id === post.author.id)
    } else {
      setIsAuthor(false)
    }
  }, [user, post.author.id])


  const handleDelete = async () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    setIsLoading(true)
    try {
      let response;
      try {
        response = await fetch(`/api/news/${post.id}`, {
          method: "DELETE",
        });
      } catch (networkError) {
        console.error("Network error:", networkError);
        toast({
          title: "Błąd sieci",
          description: "Nie udało się połączyć z serwerem. Sprawdź swoje połączenie internetowe.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: "Nieznany błąd" };
        }
        throw new Error(errorData.error || "Wystąpił błąd podczas usuwania wpisu");
      }

      toast({
        title: "Wpis usunięty",
        description: "Wpis został pomyślnie usunięty",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania wpisu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleEdit = () => {
    // Implement edit logic here
    toast({
      title: "Edycja wpisu",
      description: "Funkcja edycji wpisu jest w przygotowaniu",
    })
  }

  return (
    <div className="mb-6">
      <Card className="mb-0" itemScope itemType="https://schema.org/SocialMediaPosting">
        <meta itemProp="datePublished" content={new Date(post.createdAt).toISOString()} />
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-3">
            <Link href={`/profil/${post.author.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <Link
                  href={`/profil/${post.author.id}`}
                  className="font-medium hover:underline"
                  itemProp="author"
                  itemScope
                  itemType="https://schema.org/Person"
                >
                  <span itemProp="name">{post.author.name}</span>
                </Link>
                {post.author.verified && (
                  <span className="text-primary text-xs" title="Zweryfikowany">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: pl,
                })}
              </div>
              

            </div>
            {post.author.id !== user?.id && (
                <FollowButton
                  userId={post.author.id}
                  isFollowing={post.author.type === "following" ? true : false}
                  size="sm"/>)}
          {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAuthor ? (
                    <>
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Usuń
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Zgłoś
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          {/* Treść wpisu */}
          <div className="whitespace-pre-wrap mb-3" itemProp="text">
            {formatTextWithBoldLinksAndHashtags(post.content)}
          </div>

          {/* Zdjęcie, jeśli post jest typu image */}
          {post.type === "image" && post.imageUrl && (
            <div className="mt-3 mb-3 rounded-md overflow-hidden">
              <Image
                src={post.imageUrl || "/placeholder.svg"}
                alt="Zdjęcie w poście"
                width={600}
                height={400}
                className="w-full object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Ankieta, jeśli post jest typu poll */}
          {post.type === "poll" && pollData && (
            <div className="mt-3 mb-3 p-3 bg-muted/30 rounded-md">
              {/* Display poll image if available */}
              {post.imageUrl && (
                <div className="mb-4 rounded-md overflow-hidden">
                  <Image
                    src={post.imageUrl || "/placeholder.svg"}
                    alt="Zdjęcie ankiety"
                    width={600}
                    height={400}
                    className="w-full object-cover max-h-[300px]"
                  />
                </div>
              )}

              <RadioGroup className="space-y-3">
                {pollData.options.map((option, index) => {
                  const voteCount = pollData.votes[index] || 0
                  const percentage = pollData.totalVotes > 0 ? Math.round((voteCount / pollData.totalVotes) * 100) : 0

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center">
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${post.id}-${index}`}
                          disabled={userVote !== undefined || isLoading || !user}
                          onClick={() => handleVote(index)}
                          className={userVote === index ? "bg-primary" : ""}
                        />
                        <Label htmlFor={`option-${post.id}-${index}`} className="pl-2 flex-1 cursor-pointer">
                          {option}
                        </Label>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </RadioGroup>
              <div className="text-xs text-muted-foreground mt-2">
                {pollData.totalVotes}{" "}
                {pollData.totalVotes === 1
                  ? "głos"
                  : pollData.totalVotes % 10 >= 2 &&
                      pollData.totalVotes % 10 <= 4 &&
                      (pollData.totalVotes % 100 < 10 || pollData.totalVotes % 100 >= 20)
                    ? "głosy"
                    : "głosów"}
              </div>
            </div>
          )}

          {/* Sprawdź, czy post zawiera URL i wyświetl podgląd */}
          {post.type === "text" && hasUrl(post.content) && <LinkPreview text={post.content} />}
        </CardContent>

        <CardFooter className="border-t pt-3 pb-3">
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={toggleComments}>
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments}</span>
              {showComments ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-1 ml-auto" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span>Udostępnij</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Komentarze wyświetlane bezpośrednio pod postem */}
      {showComments && (
        <div className="mt-1 pl-4 border-l-2 border-muted">
          <NewsComments
            postId={post.id}
            user={
              user
                ? {
                    id: user.id,
                    name: user.name,
                    avatar:
                      user.avatar ||
                      `/placeholder.svg?height=40&width=40&text=${user.name.substring(0, 2).toUpperCase()}`,
                  }
                : null
            }
          />
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Usuń wpis</DialogTitle>
            <DialogDescription>Czy na pewno chcesz usunąć ten wpis? Ta akcja jest nieodwracalna.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              Anuluj
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

