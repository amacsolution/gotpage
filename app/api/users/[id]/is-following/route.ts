import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// Mock database or service to check if a user is following another user

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  const user = await auth(req)
  if (!user) {
    return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
  }   

  try {
    // Replace this with your actual logic to check if the user is being followed

    const response = await query(
      `SELECT EXISTS(SELECT 1 FROM user_follows WHERE follower_id = ? AND target_id = ?) as is_following`, [user.id, id]
    ) as { is_following: number }[]

    return response[0].is_following === 0 
      ? NextResponse.json({ isFollowing: false }) 
      : NextResponse.json({ isFollowing: true });

  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      {isFollowing: false},
    );
  }
}