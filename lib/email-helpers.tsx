import { emailService } from "./email-service"
import { emailConfig } from "@/emails/config"
import { WelcomeEmail } from "@/emails/templates/welcome-email"
import { PasswordReset } from "@/emails/templates/password-reset"
import { NewAdNotification } from "@/emails/templates/new-ad-notification"
import { AdExpiration } from "@/emails/templates/ad-expiration"
import { MessageNotification } from "@/emails/templates/message-notification"
import { PaymentConfirmation } from "@/emails/templates/payment-confirmation"

// Dodaj ten import na górze pliku
import { AdConfirmation } from "@/emails/templates/ad-confirmation"
import { MigrationInvitation, NotifyAdmin } from "@/emails"

/**
 * Wysyła email powitalny po rejestracji
 */
export async function sendWelcomeEmail(params: {
  email: string
  userName: string
  verificationToken: string
}) {
  const { email, userName, verificationToken } = params
  const verificationUrl = `${emailConfig.appUrl}/verify?token=${verificationToken}`

  return emailService.sendEmail({
    to: email,
    subject: "Witamy w serwisie ogłoszeniowym",
    emailComponent: <WelcomeEmail userName={userName} verificationUrl={verificationUrl} />,
  })
}

/**
 * Wysyła email z linkiem do resetowania hasła
 */
export async function sendPasswordResetEmail(params: {
  email: string
  userName: string
  resetToken: string
  expirationTime?: string
}) {
  const { email, userName, resetToken, expirationTime = "1 godzinę" } = params
  const resetUrl = `${emailConfig.appUrl}/reset-password/${resetToken}`

  return emailService.sendEmail({
    to: email,
    subject: "Resetowanie hasła",
    emailComponent: <PasswordReset userName={userName} resetUrl={resetUrl} expirationTime={expirationTime} />,
  })
}

export async function sendNotifyAdmin(params: {
  body: string
  user?: string
  stack: string
  url: string
}) {
  const { body, user, stack, url } = params
  const date = new Date
  const subject = `Błąd na stronie gotpage - ${date}`

  return emailService.sendEmail({
    to: 'bugs@gotpage.pl',
    subject,
    emailComponent: <NotifyAdmin body={body} user={user} stack={stack} url={url} />,
  })
}


/**
 * Wysyła powiadomienie o nowym ogłoszeniu
 */
export async function sendNewAdNotificationEmail(params: {
  email: string
  userName: string
  adTitle: string
  adDescription: string
  adId: string
  adImageUrl?: string
}) {
  const { email, userName, adTitle, adDescription, adId, adImageUrl } = params
  const adUrl = `${emailConfig.appUrl}/ogloszenia/${adId}`

  return emailService.sendEmail({
    to: email,
    subject: `Nowe ogłoszenie: ${adTitle}`,
    emailComponent: (
      <NewAdNotification
        userName={userName}
        adTitle={adTitle}
        adDescription={adDescription}
        adUrl={adUrl}
        adImageUrl={adImageUrl}
      />
    ),
  })
}

/**
 * Wysyła powiadomienie o wygasającym ogłoszeniu
 */
export async function sendAdExpirationEmail(params: {
  email: string
  userName: string
  adTitle: string
  adId: string
  expirationDate: string
}) {
  const { email, userName, adTitle, adId, expirationDate } = params
  const renewUrl = `${emailConfig.appUrl}/ogloszenia/${adId}/renew`

  return emailService.sendEmail({
    to: email,
    subject: `Twoje ogłoszenie "${adTitle}" wkrótce wygaśnie`,
    emailComponent: (
      <AdExpiration userName={userName} adTitle={adTitle} expirationDate={expirationDate} renewUrl={renewUrl} />
    ),
  })
}

/**
 * Wysyła powiadomienie o nowej wiadomości
 */
export async function sendMessageNotificationEmail(params: {
  email: string
  userName: string
  senderName: string
  adTitle: string
  messagePreview: string
  conversationId: string
}) {
  const { email, userName, senderName, adTitle, messagePreview, conversationId } = params
  const conversationUrl = `${emailConfig.appUrl}/wiadomosci/${conversationId}`

  return emailService.sendEmail({
    to: email,
    subject: `Nowa wiadomość od ${senderName} dotycząca ogłoszenia "${adTitle}"`,
    emailComponent: (
      <MessageNotification
        userName={userName}
        senderName={senderName}
        adTitle={adTitle}
        messagePreview={messagePreview}
        conversationUrl={conversationUrl}
      />
    ),
  })
}

/**
 * Wysyła potwierdzenie płatności
 */
export async function sendPaymentConfirmationEmail(params: {
  email: string
  userName: string
  orderNumber: string
  paymentDate: string
  amount: string
  currency?: string
  packageName: string
  packageDuration: string
  invoiceId?: string
  vatNumber?: string
}) {
  const {
    email,
    userName,
    orderNumber,
    paymentDate,
    amount,
    currency = "PLN",
    packageName,
    packageDuration,
    invoiceId,
    vatNumber,
  } = params

  const accountUrl = `${emailConfig.appUrl}/konto/platnosci`
  const invoiceUrl = invoiceId ? `${emailConfig.appUrl}/faktury/${invoiceId}` : undefined

  return emailService.sendEmail({
    to: email,
    subject: `Potwierdzenie płatności - ${orderNumber}`,
    emailComponent: (
      <PaymentConfirmation
        userName={userName}
        orderNumber={orderNumber}
        paymentDate={paymentDate}
        amount={amount}
        currency={currency}
        packageName={packageName}
        packageDuration={packageDuration}
        invoiceUrl={invoiceUrl}
        accountUrl={accountUrl}
        vatNumber={vatNumber}
      />
    ),
  })
}

/**
 * Wysyła email z potwierdzeniem dodania ogłoszenia
 */
export async function sendAdConfirmationEmail(params: {
  email: string
  userName: string
  adTitle: string
  adId: string
  isPromoted: boolean
  promotionUrl?: string
}) {
  const { email, userName, adTitle, adId, isPromoted, promotionUrl } = params

  return emailService.sendEmail({
    to: email,
    subject: `Twoje ogłoszenie "${adTitle}" zostało dodane`,
    emailComponent: (
      <AdConfirmation
        userName={userName}
        adTitle={adTitle}
        adId={adId}
        isPromoted={isPromoted}
        promotionUrl={promotionUrl}
      />
    ),
  })
}

/**
 * Wysyła email z zaproszeniem do migracji ze starego serwisu
 */
export async function sendMigrationInvitationEmail(params: {
  email: string
  userName?: string
  oldServiceName?: string
  newServiceName?: string
}) {
  const { email, userName, oldServiceName = "gotpage", newServiceName = "Nowy Serwis Ogłoszeniowy Gotpage" } = params
  const registrationUrl = `${emailConfig.appUrl}/register?source=migration&email=${encodeURIComponent(email)}`

  return emailService.sendEmail({
    to: email,
    subject: `Zaproszenie do nowego serwisu ${newServiceName}`,
    emailComponent: (
      <MigrationInvitation
        userName={userName}
        registrationUrl={registrationUrl}
        oldServiceName={oldServiceName}
        newServiceName={newServiceName}
      />
    ),
  })
}