import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface MessageNotificationProps {
  userName: string
  senderName: string
  adTitle: string
  messagePreview: string
  conversationUrl: string
}

export const MessageNotification: React.FC<MessageNotificationProps> = ({
  userName = "Użytkowniku",
  senderName = "Jan Kowalski",
  adTitle = "Tytuł ogłoszenia",
  messagePreview = "Treść wiadomości...",
  conversationUrl = "https://twojadomena.pl/messages/123",
}) => {
  return (
    <Layout userName={userName} title="Nowa wiadomość" previewText={`Nowa wiadomość od ${senderName} dotycząca ogłoszenia "${adTitle}"`}>
      <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Otrzymałeś/aś nową wiadomość od <strong>{senderName}</strong> dotyczącą Twojego ogłoszenia{" "}
        <strong>"{adTitle}"</strong>.
      </p>

      <div
        style={{
          backgroundColor: "#F9FAFB",
          borderLeft: "4px solid #3B82F6",
          padding: "16px",
          borderRadius: "0 4px 4px 0",
          margin: "0 0 24px 0",
        }}
      >
        <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0", fontStyle: "italic" }}>
          "{messagePreview.length > 150 ? `${messagePreview.substring(0, 150)}...` : messagePreview}"
        </p>
      </div>

      <Button href={conversationUrl}>Odpowiedz na wiadomość</Button>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Szybka odpowiedź zwiększa szanse na finalizację transakcji!
      </p>

    </Layout>
  )
}
