import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { UserData } from '../profile/route';
import { AdData } from '../ogloszenia/route';
import { categories } from '@/lib/ad-categories';


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
        const ads = await query(
            `
            SELECT id, title, description, category, subcategory FROM ads
            `
        ) as AdData[]

        const formattedUsers = ads.map(ad => ({
            id: ad.id,
            title: ad.title,
            description: ad.description,
            category: ad.category,
            subcategory: ad.subcategory,
            slug: slugify(ad.title)
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    } 
}