import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { UserData } from '../profile/route';


const slugify = (text : string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // zamień spacje na "-"
      .replace(/[^\w\-]+/g, '')        // usuń wszystko co nie jest literą/liczbą
      .replace(/\-\-+/g, '-')          // zamień wiele "-" na jedno "-"
  };
  

export async function GET() {
    try {
        const users = await query(
            `
            SELECT id, name FROM users
            `
        ) as UserData[]

        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            slug: slugify(user.name)
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    } 
}