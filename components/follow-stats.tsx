"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FollowersList } from "./followers-list"

interface FollowStatsProps {
  userId: string | number
  followers: number
  following: number
}

export function FollowStats({ userId, followers, following }: FollowStatsProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers")

  return (
    <div className="flex gap-4 text-sm">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setActiveTab("followers")}>
            <span className="font-bold">{followers}</span> obserwujących
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Obserwujący</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <FollowersList userId={userId} type="followers" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setActiveTab("following")}>
            <span className="font-bold">{following}</span> obserwuje
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Obserwuje</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <FollowersList userId={userId} type="following" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
