import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const user = await auth(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, optionId } = await req.json()

    if (!postId || !optionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the post and check if it's a poll
    const postResult = await query("SELECT id, poll_data FROM news_posts WHERE id = ? AND type = 'poll'", [postId]) as {id: number, poll_data: string}[]

    if (!postResult || postResult.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    const post = postResult[0]

    // Parse poll data
    const pollData = typeof post.poll_data === "string" ? JSON.parse(post.poll_data) : post.poll_data

    if (!pollData) {
      return NextResponse.json({ error: "Invalid poll data" }, { status: 400 })
    }

    // Get option index from optionId (format: "opt1", "opt2", etc.)
    const optionIndex = Number.parseInt(optionId.replace("opt", "")) - 1

    if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= pollData.options.length) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 })
    }

    // Check if user has already voted
    const previousVote = pollData.userVotes && pollData.userVotes[user.id]

    // If user has already voted for a different option, decrement that option's count
    if (previousVote !== undefined && previousVote !== optionIndex) {
      pollData.votes[previousVote] = Math.max(0, (pollData.votes[previousVote] || 0) - 1)
    }

    // If user hasn't voted yet or voted for a different option
    if (previousVote === undefined || previousVote !== optionIndex) {
      // Increment vote count for selected option
      pollData.votes[optionIndex] = (pollData.votes[optionIndex] || 0) + 1

      // Record user's vote
      if (!pollData.userVotes) {
        pollData.userVotes = {}
      }
      pollData.userVotes[user.id] = optionIndex

      // Update total votes if user hasn't voted before
      if (previousVote === undefined) {
        pollData.totalVotes = (pollData.totalVotes || 0) + 1
      }

      // Update poll data in database
      await query("UPDATE news_posts SET poll_data = ? WHERE id = ?", [JSON.stringify(pollData), postId])
    }

    return NextResponse.json({
      success: true,
      pollData: {
        options: pollData.options.map((option: string, index : number) => ({
          id: `opt${index + 1}`,
          text: option,
          votes: pollData.votes[index] || 0,
        })),
        totalVotes: pollData.totalVotes || 0,
        userVote: `opt${optionIndex + 1}`,
      },
    })
  } catch (error) {
    console.error("Error voting on poll:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

