

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
    const { id: idWpisu } = await params

    // Pobierz wpis z bazy danych
    const odpowiedz = await fetch(`https://gotpage.pl/api/news/${idWpisu}`)

    if (!odpowiedz.ok) {
      return {
        title: "Aktualności",
        description: "Przeczytaj najnowsze aktualności na naszej platformie ogłoszeniowej",
      }
    }

    const wpis: NewsPostProps[] = await odpowiedz.json()
    const daneWpisu = wpis[0]

    // Utwórz czysty fragment treści
    const fragment = daneWpisu.post.content
      ? daneWpisu.post.content.substring(0, 160).replace(/\n/g, " ") +
      (daneWpisu.post.content.length > 160 ? "..." : "")
      : "Przeczytaj najnowszy wpis na naszej platformie ogłoszeniowej"

    // Pobierz obrazy z treści, jeśli są dostępne
    const obrazy = []
    if (daneWpisu.post.imageUrl) {
      obrazy.push(daneWpisu.post.imageUrl)
    }

    // Pobierz podstawowe metadane z rodzica
    const poprzednieObrazy = (await rodzic).openGraph?.images || []

    return {
      title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
      description: fragment,
      authors: [{ name: daneWpisu.post.author.name }],
      openGraph: {
        title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
        description: fragment,
        type: "article",
        publishedTime: daneWpisu.post.createdAt,
        authors: [daneWpisu.post.author.name],
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
      description: "Przeczytaj najnowsze aktualności na naszej platformie ogłoszeniowej",
    }
  }
}

export default async function Page({ params }: PropsStrony) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return <PostWrapper id={id} />;
}