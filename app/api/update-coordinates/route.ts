import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/db'

const getCoordinates = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search.php?format=jsonv2&q=${encodeURIComponent(address)}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.length > 0) {
      return { lat: data[0].lat, lng: data[0].lon }
    } else {
      console.warn("Nie znaleziono współrzędnych dla adresu:", address)
      return null
    }
  } catch (error) {
    console.error("Błąd podczas pobierania współrzędnych:", error)
    return null
  }
}

export async function GET(req: Request) {
  try {
    const ads = await query(
      'SELECT id, location, adress FROM ads WHERE coordinates = "null" LIMIT 30'
    ) as { id: string, location: string, adress: string }[]

    const results = []

    let timer = 0

    for (const ad of ads) {
      let coordinates = null

      if (ad.location){
        console.log("parsowanie dla: " + ad.location)
        coordinates = await getCoordinates(ad.location)
      }

      await query(
        "UPDATE ads SET coordinates = ? WHERE id = ?",
        [JSON.stringify(coordinates), ad.id]
      )

      results.push({ id: ad.id, coordinates })
      timer ++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return new Response(
      JSON.stringify({ updated: results.length, results, timer}),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
