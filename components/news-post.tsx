"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { HeartIcon, MessageSquare, Share2, MoreVertical, Trash, Edit } from "lucide-react"
import { PollDisplay } from "./poll-display"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: Date
}

export interface NewsPostProps {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  isPoll: boolean
  pollQuestion?: string
  pollOptions?: PollOption[]
  pollTotalVotes?: number
  userVotedOption?: string
  image?: string
  pollImage?: string
  createdAt: Date
  likes: number
  comments: number
  commentsList?: Comment[]
  isLiked?: boolean
  currentUserId?: string
  onLike?: (id: string) => void
  onComment?: (id: string, content: string) => void
  onDeletePost?: (id: string) => void
  onEditPost?: (id: string, content: string) => void
  onVote?: (pollId: string, optionId: string) => void
}

export function NewsPost({
  id,
  author,
  content,
  isPoll,
  pollQuestion,
  pollOptions,
  pollTotalVotes = 0,
  userVotedOption,
  image,
  pollImage,
  createdAt,
  likes,
  comments,
  commentsList = [],
  isLiked = false,
  currentUserId,
  onLike,
  onComment,
  onDeletePost,
  onEditPost,
  onVote,
}: NewsPostProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)

  const isAuthor = currentUserId === author.id

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1))
    if (onLike) onLike(id)
  }

  const handleVote = (pollId: string, optionId: string) => {
    if (onVote) onVote(pollId, optionId)
  }

  const handleCommentSubmit = () => {
    if (commentText.trim() && onComment) {
      onComment(id, commentText)
      setCommentText("")
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedContent(content)
  }

  const handleSaveEdit = () => {
    if (onEditPost && editedContent.trim()) {
      onEditPost(id, editedContent)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(content)
  }

  const handleDelete = () => {
    if (onDeletePost) {
      onDeletePost(id)
    }
  }

  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "recently"

  return (
    <Card className="mb-4 border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-semibold">{author.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</div>
          </div>
        </div>

        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edytuj</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                <Trash className="mr-2 h-4 w-4" />
                <span>Usuń</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Anuluj
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Zapisz
              </Button>
            </div>
          </div>
        ) : (
          <>
            {content && <p className="mb-4">{content}</p>}

            {!isPoll && image && (
              <div className="mt-3 overflow-hidden rounded-md">
                <img src={image || "/placeholder.svg"} alt="Post attachment" className="w-full object-cover" />
              </div>
            )}

            {isPoll && pollQuestion && pollOptions && (
              <div className="mt-3">
                {pollImage && (
                  <div className="mb-4 overflow-hidden rounded-md">
                    <img src={pollImage || "/placeholder.svg"} alt="Poll attachment" className="w-full object-cover" />
                  </div>
                )}

                <PollDisplay
                  pollId={id}
                  question={pollQuestion}
                  options={pollOptions}
                  totalVotes={pollTotalVotes}
                  userVote={userVotedOption}
                  onVote={handleVote}
                  className="bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                />
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col p-0 w-full">
        <div className="flex items-center justify-between p-4 pt-2 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
            >
              <HeartIcon size={18} className={cn(liked && "fill-red-500 text-red-500")} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <MessageSquare size={18} />
              <span>{comments}</span>
            </button>
          </div>

          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <Share2 size={18} />
            <span>Udostępnij</span>
          </button>
        </div>

        {showComments && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800 w-full">
            <div className="mb-4 space-y-4 w-full">
              {commentsList && commentsList.length > 0 ? (
                commentsList.map((comment) => (
                  <div key={comment.id} className="flex gap-3 w-full">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                      <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                      <div className="mb-1 font-medium">{comment.authorName}</div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Brak komentarzy. Bądź pierwszy!</p>
              )}
            </div>

            <div className="flex gap-2 w-full">
              <Textarea
                placeholder="Dodaj komentarz..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] flex-grow"
              />
              <Button onClick={handleCommentSubmit} className="self-end flex-shrink-0">
                Wyślij
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

