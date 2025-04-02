import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, optionId } = await request.json()

    if (!postId || !optionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if post exists and is a poll
    const post = await db.post.findUnique({
      where: {
        id: postId,
        isPoll: true,
      },
      include: {
        pollOptions: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Check if option exists in this poll
    const option = post.pollOptions.find((opt) => opt.id === optionId)

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 })
    }

    // Check if user has already voted on this poll
    const existingVote = await db.pollVote.findFirst({
      where: {
        postId,
        userId: session.user.id,
      },
    })

    if (existingVote) {
      // Update existing vote
      await db.pollVote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          optionId,
        },
      })
    } else {
      // Create new vote
      await db.pollVote.create({
        data: {
          postId,
          optionId,
          userId: session.user.id,
        },
      })

      // Increment vote count for the option
      await db.pollOption.update({
        where: {
          id: optionId,
        },
        data: {
          votes: {
            increment: 1,
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error voting on poll:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

