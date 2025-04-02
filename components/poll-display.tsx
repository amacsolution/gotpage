"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface PollDisplayProps {
  pollId: string
  question: string
  options: PollOption[]
  totalVotes: number
  userVote?: string
  onVote: (pollId: string, optionId: string) => void
  className?: string
}

export function PollDisplay({ pollId, question, options, totalVotes, userVote, onVote, className }: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(userVote)
  const [hasVoted, setHasVoted] = useState<boolean>(!!userVote)

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      onVote(pollId, selectedOption)
      setHasVoted(true)
    }
  }

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((votes / totalVotes) * 100)
  }

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="mb-3 font-medium">{question}</h3>

      {hasVoted ? (
        <div className="space-y-3">
          {options.map((option) => {
            const percentage = getPercentage(option.votes)
            const isSelected = option.id === userVote

            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={cn(isSelected && "font-medium")}>{option.text}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={cn("h-full rounded-full bg-red-500", isSelected ? "bg-red-500" : "bg-red-400")}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {totalVotes} {totalVotes === 1 ? "głos" : "głosów"}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>

          <Button onClick={handleVote} disabled={!selectedOption} className="w-full">
            Głosuj
          </Button>
        </div>
      )}
    </div>
  )
}

