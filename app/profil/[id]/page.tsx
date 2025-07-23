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
    const response = await fetch(`https://gotpage.pl/api/users/${id}`);

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

  const title = `${name} jest na Gotpage - zobacz profil`;
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
          url: baseUrl + avatar,
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
      images: [baseUrl + avatar],
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

// Komponent serwerowy, który renderuje komponent kliencki
export default async function AdDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UserProfilePage id={id} />
}

