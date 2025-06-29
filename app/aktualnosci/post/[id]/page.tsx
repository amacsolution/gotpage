

// Zmień importy i typy na polskie nazwy gdzie to możliwe
import { type NewsPostProps } from "@/components/news-post";
import type { Metadata, ResolvingMetadata } from "next";
import PostWrapper from "./page-clean";
type PropsStrony = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PropsStrony, rodzic: ResolvingMetadata): Promise<Metadata> {
  // Pobierz dane wpisu
  try {
    const { id } = await params

    // Pobierz wpis z bazy danych
    if (!id) return {
      title: "Aktualności",
      description: "Przeczytaj najnowsze aktualności na naszej platformie ogłoszeniowej | Gotpage",
    }
    const res = await fetch(`https://gotpage.pl/api/news/${id}`)

    if (!res.ok) {
      return {
        title: "Aktualności",
        description: "Przeczytaj najnowsze aktualności na naszej platformie ogłoszeniowej | Gotpage",
      }
    }
    const wpis = await res.json()
    const daneWpisu = wpis

    // Utwórz czysty fragment treści
    const fragment = daneWpisu?.content
      ? daneWpisu.content.substring(0, 160).replace(/\n/g, " ") +
      (daneWpisu.content.length > 160 ? "..." : "")
      : "Przeczytaj najnowszy wpis na naszej platformie ogłoszeniowej | Gotpage"

    // Pobierz obrazy z treści, jeśli są dostępne
    const obrazy = []
    if (daneWpisu.imageUrl) {
      obrazy.push(daneWpisu.imageUrl)
    }

    // Pobierz podstawowe metadane z rodzica
    const poprzednieObrazy = (await rodzic).openGraph?.images || []

    return {
      title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
      description: fragment,
      authors: [{ name: daneWpisu.author.name }],
      openGraph: {
        title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
        description: fragment,
        type: "article",
        publishedTime: daneWpisu.createdAt,
        authors: [daneWpisu.author.name],
        images: [...obrazy, ...poprzednieObrazy],
      },
      twitter: {
        card: "summary_large_image",
        title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
        description: fragment,
        images: obrazy.length > 0 ? [obrazy[0]] : undefined,
      },
    }
  } catch (blad) {
    console.error("Błąd podczas generowania metadanych:", blad)
    return {
      title: "Aktualności",
      description: "Przeczytaj najnowsze aktualności na naszej platformie ogłoszeniowej | Gotpage",
    }
  }
}

export default async function Page({ params }: PropsStrony) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return <PostWrapper id={id} />;
}