import { query } from "../lib/db";

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

async function SetCoordinates() {
  const ads = await query('SELECT id, location, adress FROM ads WHERE coordinates = "" LIMIT 1') as {id: string, location: string, adress: string}[]

  let coordinates: { lat: string, lng: string } | null = null

  for (const ad of ads) {
    if (ad.location && ad.adress) {
      const fullAddress = `${ad.location}, ${ad.adress}`
      coordinates = await getCoordinates(fullAddress)
    } else if (ad.location) {
      coordinates = await getCoordinates(ad.location)
    } else {
      coordinates = null
    }
    await query("INSERT INTO ads SET coordinates=? WHERE id=?", [JSON.stringify(coordinates), ad.id])
  }
}

SetCoordinates()