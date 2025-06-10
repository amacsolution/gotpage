import type { Metadata, ResolvingMetadata } from "next";
import UserProfilePage from "./profile-page";

export const dynamic = "force-dynamic";

// Dynamiczne metadane dla strony profilu użytkownika
export async function generateMetadata(props: { params: Promise<{ id: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;


  const { id } = params;
  let user: {
    name?: string;
    bio?: string;
    avatar?: string;
  } | null = null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
      next: { revalidate: 60 }, // Opcjonalne: cache na 60 sek. jeśli dane rzadko się zmieniają
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        user = data;
      }
    }
  } catch (error) {
    console.error("Błąd podczas pobierania profilu:", error);
  }

  // Fallback dane
  const name = user?.name || "Użytkownik serwisu Gotpage";
  const bio = user?.bio || "Szczegóły profilu użytkownika";
  const avatar = user?.avatar || "/placeholder-user.jpg";

  const title = `Zobacz profil ${name} na Gotpage`;
  const description = bio.length > 160 ? bio.substring(0, 157) + "..." : bio;
  const baseUrl = "https://gotpage.pl";
  const profileUrl = `${baseUrl}/profil/${id}`;

  return {
    title,
    description,
    keywords: `${name}, prywatny profil, gotpage`,
    openGraph: {
      title,
      description,
      url: profileUrl,
      images: [
        {
          url: avatar,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [avatar],
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

// Komponent serwerowy, który renderuje komponent kliencki
export default async function AdDetailsPage({ params }: { params: { id: string } }) {

  const { id } = await params
  return <UserProfilePage id={id} />
}

