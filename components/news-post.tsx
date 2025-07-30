"use client"

import React, { type JSX, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Heart, MessageSquare, Share2, Trash2, Edit } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { NewsComments } from "./news-comments"
import { ImageGrid } from "./image-grid"
import { useUser } from "@/lib/user-context"

interface User {
  id: string
  name: string
  avatar?: string
  email?: string
}

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
    imageUrls?: string[]
    pollData?: {
      options: string[]
      votes: number[]
      totalVotes: number
      userVote?: number
    }
    author: {
      id: string
      name: string
      avatar: string
      type: string
      verified: boolean
    }
  }
  logged?: User
  onVote?: (postId: string, optionId: string) => Promise<void>
  onLike?: (postId: string) => Promise<void>
  onComment?: (postId: string, content: string) => Promise<void>
  onDeletePost?: (postId: string) => Promise<void>
  onEditPost?: (postId: string, content: string) => Promise<void>
  onFollow?: (userId: string) => Promise<void>
  showFollowButton?: boolean
}

export const NewsPost: React.FC<NewsPostProps> = ({
  post,
  logged,
  onVote,
  onLike,
  onComment,
  onDeletePost,
  onEditPost,
  onFollow,
  showFollowButton,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [pollData, setPollData] = useState(post.pollData)
  const [userVote, setUserVote] = useState(post.pollData?.userVote)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const { toast } = useToast()
  const { user } = useUser()

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-indexed
    const year = date.getFullYear()

    return `${day}.${month}.${year}`
  }

  const formatTextWithBoldLinksAndHashtags = (text: string): JSX.Element[] => {
    const parts: JSX.Element[] = []
    let index = 0

    // Regular expression to match bold text, links, and hashtags
    const regex = /(\*\*([^*]+)\*\*)|(https?:\/\/[^\s]+)|(#\w+)/g

    let match

    while ((match = regex.exec(text)) !== null) {
      // Text before the match
      if (match.index > index) {
        parts.push(<React.Fragment key={`text-${index}`}>{text.substring(index, match.index)}</React.Fragment>)
      }

      if (match[2]) {
        // Bold text
        parts.push(<strong key={`bold-${index}`}>{match[2]}</strong>)
      } else if (match[3]) {
        // Link
        parts.push(
          <a
            key={`link-${index}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {match[3]}
          </a>,
        )
      } else if (match[4]) {
        // Hashtag
        parts.push(
          <span key={`hashtag-${index}`} className="text-primary cursor-pointer hover:underline">
            {match[4]}
          </span>,
        )
      }

      index = regex.lastIndex
    }

    // Remaining text after the last match
    if (index < text.length) {
      parts.push(<React.Fragment key={`text-${index}`}>{text.substring(index)}</React.Fragment>)
    }

    return parts
  }

  const handleLike = async () => {
    if (!logged) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany, aby polubić post.",
      })
      return
    }

    setIsLoading(true)
    try {
      if (onLike) {
        await onLike(post.id.toString())
        setIsLiked(!isLiked)
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas polubienia posta.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.content,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error))
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        description: "Link skopiowany do schowka!",
      })
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  const handleVote = async (optionId: string) => {
    if (!logged) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany, aby głosować.",
      })
      return
    }

    if (userVote) {
      toast({
        title: "Błąd",
        description: "Możesz głosować tylko raz.",
      })
      return
    }

    setIsLoading(true)
    try {
      if (onVote) {
        await onVote(post.id.toString(), optionId)
        setUserVote(Number.parseInt(optionId))

        // Update poll data optimistically
        setPollData((prevData) => {
          if (!prevData) return prevData

          const newVotes = [...prevData.votes]
          newVotes[Number.parseInt(optionId)] = newVotes[Number.parseInt(optionId)] + 1

          return {
            ...prevData,
            votes: newVotes,
            totalVotes: prevData.totalVotes + 1,
            userVote: Number.parseInt(optionId),
          }
        })
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas głosowania.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false)
    setIsLoading(true)

    try {
      if (onDeletePost) {
        await onDeletePost(post.id.toString())
        toast({
          description: "Post został usunięty.",
        })
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas usuwania posta.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleEdit = async () => {
    setIsLoading(true)
    try {
      if (onEditPost) {
        await onEditPost(post.id.toString(), editedContent)
        toast({
          description: "Post został zaktualizowany.",
        })
        setIsEditMode(false)
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas edycji posta.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePercentage = (votes: number, totalVotes: number): number => {
    if (totalVotes === 0) return 0
    return (votes / totalVotes) * 100
  }

  const renderContent = () => {
    if (isEditMode) {
      return (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      )
    }

    const shouldTruncate = post.content.length > 150 && !isExpanded
    const displayContent = shouldTruncate ? post.content.substring(0, 150) + "..." : post.content

    return (
      <>
        {formatTextWithBoldLinksAndHashtags(displayContent)}
        {post.content.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:underline text-sm font-medium ml-2 transition-colors"
          >
            {isExpanded ? "Pokaż mniej" : "Czytaj więcej"}
          </button>
        )}
      </>
    )
  }

  let images: string[] = []
  if ( post.type === "image" && post.imageUrl){
    images.push(post.imageUrl)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-row items-center space-x-4">
          <Avatar>
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium">{post.author.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: pl,
              })}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Otwórz menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Usuń
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Zgłoś</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {post.type === "text" && (
          <div className="whitespace-pre-wrap mb-3" itemProp="text">
            {(() => {
              const shouldTruncate = post.content.length > 150 && !isExpanded
              const displayContent = shouldTruncate ? post.content.substring(0, 150) + "..." : post.content

              return (
                <>
                  {formatTextWithBoldLinksAndHashtags(displayContent)}
                  {post.content.length > 150 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-primary hover:underline text-sm font-medium ml-2 transition-colors"
                    >
                      {isExpanded ? "Pokaż mniej" : "Czytaj więcej"}
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        )}
        {post.type === "image" && images.length > 0 && (
          <ImageGrid images={images} alt={post.id + new Date().toISOString()}/>
        )}
        {post.type === "image" && post.imageUrls && (
            <ImageGrid images={post.imageUrls} alt={post.createdAt}/>
        )}
        {post.type === "poll" && pollData && (
          <div>
            <RadioGroup
              defaultValue={userVote !== undefined ? userVote.toString() : undefined}
              onValueChange={(value) => handleVote(value)}
              disabled={userVote !== undefined || isLoading}
            >
              {pollData.options.map((option, index) => {
                const voteCount = pollData.votes[index] || 0
                const percentage = calculatePercentage(voteCount, pollData.totalVotes)

                return (
                  <div key={index} className="mb-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`option-${index}`} className="mr-2">
                        {option}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {voteCount} / {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="mb-2" />
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} className="sr-only" />
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleLike} disabled={isLoading}>
            {isLoading ? (
              <Skeleton  className="rounded-full w-20 h-20" />
            ) : (
              <Heart className={cn("h-5 w-5", isLiked && "text-red-500")} fill={isLiked ? "red" : "none"} />
            )}
            <span className="sr-only">Like</span>
          </Button>
          <span>{likesCount}</span>
          <Button variant="ghost" size="icon" onClick={toggleComments}>
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Comment</span>
          </Button>
          <span>{post.comments}</span>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
        {logged && showFollowButton && logged.id !== post.author.id && (
          <Button size="sm" onClick={() => onFollow && onFollow(post.author.id)}>
            Obserwuj
          </Button>
        )}
      </CardFooter>
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Jesteś pewny/a?</DialogTitle>
            <DialogDescription>Czy na pewno chcesz usunąć ten post? Ta akcja jest nieodwracalna.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button type="submit" variant="destructive" onClick={handleDelete}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditMode} onOpenChange={() => setIsEditMode(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edytuj post</DialogTitle>
            <DialogDescription>Zaktualizuj treść swojego posta.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Treść
              </Label>
              <div className="col-span-3">{renderContent()}</div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>
              Anuluj
            </Button>
            <Button type="submit" onClick={handleEdit}>
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
