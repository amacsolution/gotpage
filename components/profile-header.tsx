"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ProfileBackgroundUpload } from "./profile-background-upload"
import { ProfileImageUpload } from "./profile-image-upload"

interface ProfileHeaderProps {
  userId: number
  username: string
  avatarUrl?: string
  backgroundUrl?: string
  isEditable?: boolean
}

export function ProfileHeader({ userId, username, avatarUrl, backgroundUrl, isEditable = false }: ProfileHeaderProps) {
  const [avatar, setAvatar] = useState<string | undefined>(avatarUrl)
  const [background, setBackground] = useState<string | undefined>(backgroundUrl)
  const [backgroundKey, setBackgroundKey] = useState<number>(Date.now())

  // Efekt do odświeżania obrazu tła po zmianie URL
  useEffect(() => {
    if (background !== backgroundUrl) {
      setBackground(backgroundUrl)
    }
  }, [backgroundUrl])

  // Funkcja do aktualizacji tła z wymuszeniem odświeżenia
  const handleBackgroundUpdate = (newBackgroundUrl: string) => {
    setBackground(newBackgroundUrl)
    setBackgroundKey(Date.now()) // Wymuszenie odświeżenia obrazu
  }

  return (
    <div className="relative w-full">
      {/* Tło profilu */}
      <div className="relative w-full h-[160px] md:h-[200px] overflow-hidden bg-muted">
        {background && (
          <div className="w-full h-full relative">
            <img
              key={backgroundKey} // Dodanie klucza do wymuszenia odświeżenia
              src={`${background}?v=${backgroundKey}`} // Dodanie parametru v do wymuszenia odświeżenia
              alt="Tło profilu"
              className="w-full h-full object-cover"
              style={{
                objectPosition: "center center",
              }}
            />
          </div>
        )}

        {isEditable && (
          <ProfileBackgroundUpload
            userId={userId}
            currentBackground={background}
            onBackgroundUpdate={handleBackgroundUpdate}
          />
        )}
      </div>

      {/* Avatar użytkownika */}
      <div className="absolute left-4 -bottom-16 rounded-full border-4 border-background bg-muted">
        <div className="relative w-32 h-32 rounded-full overflow-hidden">
          {avatar ? (
            <Image
              src={avatar || "/placeholder.svg"}
              alt={`Avatar użytkownika ${username}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 128px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {isEditable && <ProfileImageUpload userName={username} userId={userId} currentAvatar={avatar} onAvatarUpdate={setAvatar} />}
      </div>
    </div>
  )
}
