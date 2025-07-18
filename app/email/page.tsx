"use client"

import { useState } from "react"
import {
    WelcomeEmail,
    PasswordReset,
    NewAdNotification,
    AdExpiration,
    MessageNotification,
    PaymentConfirmation,
    AdConfirmation,
    MigrationInvitation,
    NotifyAdmin,
} from "@/emails/index"
import { Input } from "@/components/ui/input"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const emailTemplates = [
    { name: "WelcomeEmail", component: WelcomeEmail },
    { name: "PasswordReset", component: PasswordReset },
    { name: "NewAdNotification", component: NewAdNotification },
    { name: "AdExpiration", component: AdExpiration },
    { name: "MessageNotification", component: MessageNotification },
    { name: "PaymentConfirmation", component: PaymentConfirmation },
    { name: "AdConfirmation", component: AdConfirmation },
    { name: "MigrationInvitation", component: MigrationInvitation },
    { name: "NotifyAdmin", component: NotifyAdmin },
]

export default function EmailPreview() {
    const [selectedTemplate, setSelectedTemplate] = useState("WelcomeEmail")

    const commonProps = {
        userName: "Antek Maciejowski",
        email: "antek@example.com",
        verificationUrl: "https://gotpage.pl/verify?token=123",
        adTitle: "Sprzedam rower górski",
        adDescription: "Rower górski w bardzo dobrym stanie, używany tylko rekreacyjnie.",
        adImageUrl: "https://gotpage.pl/placeholder.svg",
        adUrl: "https://gotpage.pl/ogloszenie/rower-123",
        expirationDate: "2025-07-30",
        renewUrl: "https://gotpage.pl/ogloszenie/rower-123/renew",
        registrationUrl: "https://gotpage.pl/register",
        oldServiceName: "OldPage",
        newServiceName: "Gotpage",
        // For PasswordReset
        token: "abc",
        // For MessageNotification
        message: "Cześć, jestem zainteresowany ogłoszeniem!",
        // For PaymentConfirmation
        amount: "49.99 zł",
        date: "2025-07-17",
        // For NotifyAdmin
        noticeEmail: "antek@example.com",
        noticeMessage: "Nowe zgłoszenie od użytkownika Antek Maciejowski.",
    }

    function renderSelectedEmail(selectedTemplate: string) {
        switch (selectedTemplate) {
            case "PasswordReset":
                return (
                    <PasswordReset
                        userName={commonProps.userName}
                        resetUrl={commonProps.verificationUrl}
                        expirationTime="1 godzina"
                    />
                )

            case "NewAdNotification":
                return (
                    <NewAdNotification
                        userName={commonProps.userName}
                        adTitle={commonProps.adTitle}
                        adDescription={commonProps.adDescription}
                        adImageUrl={commonProps.adImageUrl}
                        adUrl={commonProps.adUrl}
                    />
                )
            case "AdExpiration":
                return (
                    <AdExpiration
                        userName={commonProps.userName}
                        adTitle={commonProps.adTitle}
                        expirationDate={commonProps.expirationDate}
                        renewUrl={commonProps.renewUrl}
                    />
                )
            case "MessageNotification":
                return (
                    <MessageNotification
                        userName="ant"
                        senderName="ant"
                        adTitle="Sprzedam rower górski"
                        messagePreview="Cześć, jestem zainteresowany ogłoszeniem!"
                        conversationUrl={commonProps.adUrl}
                    />
                )
            case "PaymentConfirmation":
                return (
                    <PaymentConfirmation
                        userName={commonProps.userName}
                        amount={commonProps.amount}
                        orderNumber="123456"
                        paymentDate="2024-05-01"
                        packageName="Premium Package"
                        packageDuration="30 days"
                        accountUrl="https://gotpage.pl/profil"
                    />
                )
            case "AdConfirmation":
                return (
                    <AdConfirmation
                        userName={commonProps.userName}
                        adTitle={commonProps.adTitle}
                        adId="ad-123"
                        isPromoted={false}
                    // adDescription={commonProps.adDescription}
                    // adImageUrl={commonProps.adImageUrl}
                    // adUrl={commonProps.adUrl}
                    />
                )
            case "MigrationInvitation":
                return (
                    <MigrationInvitation
                        userName={commonProps.userName}
                        registrationUrl={commonProps.registrationUrl}
                        oldServiceName={commonProps.oldServiceName}
                        newServiceName={commonProps.newServiceName}
                    />
                )
            case "NotifyAdmin":
                return (
                    <NotifyAdmin
                        body={commonProps.noticeMessage}
                        user={commonProps.userName}
                        stack="Stack trace here"
                        url="https://gotpage.pl/error"
                    // email={commonProps.email}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="p-4 space-y-4">
            <select
                className="p-2 border border-gray-300 rounded"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
            >
                {emailTemplates.map((t) => (
                    <option key={t.name} value={t.name}>
                        {t.name}
                    </option>
                ))}
            </select>

            <div className="border rounded shadow p-4 bg-background">{renderSelectedEmail(selectedTemplate)}</div>
        </div>
    )
}
