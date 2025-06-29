import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params

    const type = await query(`
        SELECT type FROM users WHERE id = ?
        `, [id]) as { type: string }[]

    const isCompany = type[0].type === 'business'

    return NextResponse.json(isCompany);
}