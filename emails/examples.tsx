import { WelcomeEmail } from "./templates/welcome-email"
import { NewAdNotification } from "./templates/new-ad-notification"
import { PasswordReset } from "./templates/password-reset"
import { AdExpiration } from "./templates/ad-expiration"
import { MessageNotification } from "./templates/message-notification"
import { PaymentConfirmation } from "./templates/payment-confirmation"
import { MigrationInvitation } from "./templates/migration-invitation"

export const emailExamples = {
  welcome: <WelcomeEmail userName="Jan Kowalski" verificationUrl="https://twojadomena.pl/verify?token=example-token" />,
  newAd: (
    <NewAdNotification
      userName="Anna Nowak"
      adTitle="Mieszkanie 3-pokojowe, 60m², Warszawa Mokotów"
      adDescription="Przestronne mieszkanie w centrum Mokotowa. 3 pokoje, kuchnia, łazienka. Blisko metra i parku."
      adImageUrl="https://via.placeholder.com/600x400?text=Mieszkanie"
      adUrl="https://twojadomena.pl/ogloszenia/123"
    />
  ),
  passwordReset: (
    <PasswordReset
      userName="Piotr Wiśniewski"
      resetUrl="https://twojadomena.pl/reset-password?token=example-token"
      expirationTime="1 godzina"
    />
  ),
  adExpiration: (
    <AdExpiration
      userName="Katarzyna Kowalczyk"
      adTitle="Samochód osobowy Toyota Corolla 2018"
      expirationDate="15.05.2023"
      renewUrl="https://twojadomena.pl/renew/123"
    />
  ),
  messageNotification: (
    <MessageNotification
      userName="Michał Nowakowski"
      senderName="Jan Kowalski"
      adTitle="Laptop Dell XPS 15"
      messagePreview="Dzień dobry, czy laptop jest jeszcze dostępny? Czy możliwa jest negocjacja ceny? Pozdrawiam, Jan"
      conversationUrl="https://twojadomena.pl/messages/123"
    />
  ),
  paymentConfirmation: (
    <PaymentConfirmation
      userName="Adam Kowalski"
      orderNumber="ORD-12345"
      paymentDate="01.05.2023"
      amount="49.99"
      currency="PLN"
      packageName="Premium"
      packageDuration="30 dni"
      invoiceUrl="https://twojadomena.pl/invoices/INV-12345.pdf"
      accountUrl="https://twojadomena.pl/konto"
      vatNumber="PL1234567890"
    />
  ),
}

export const MigrationInvitationExample = () => (
  <MigrationInvitation
    userName="Jan Kowalski"
    registrationUrl="https://twojadomena.pl/register?source=migration"
    oldServiceName="GotPage"
    newServiceName="Nowy Serwis Ogłoszeniowy"
  />
)
