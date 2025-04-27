import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Regulamin | Gotpage",
  description: "Regulamin korzystania z serwisu Gotpage.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Regulamin serwisu Gotpage</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-500 mb-8">Ostatnia aktualizacja: 1 kwietnia 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§1. Postanowienia ogólne</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Niniejszy Regulamin określa zasady korzystania z serwisu internetowego Gotpage, dostępnego pod
              adresem https://gotpage.pl.
            </li>
            <li>
              Właścicielem serwisu jest Gotpage z siedzibą w Poddębicach, ul. Łódzka 66,
              99-200 Poddębice, 
              {/* wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS
              0000123456, NIP 1234567890, REGON 123456789, kapitał zakładowy 50 000 PLN. */}
            </li>
            <li>Korzystanie z serwisu oznacza akceptację niniejszego Regulaminu.</li>
            <li>
              Użytkownikiem serwisu może być każda osoba fizyczna posiadająca pełną zdolność do czynności prawnych,
              osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, której ustawa przyznaje
              zdolność prawną.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§2. Definicje</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Serwis</strong> - serwis internetowy Gotpage dostępny pod adresem
              https://gotpage.pl.
            </li>
            <li>
              <strong>Użytkownik</strong> - osoba fizyczna, prawna lub jednostka organizacyjna nieposiadająca osobowości
              prawnej, korzystająca z serwisu.
            </li>
            <li>
              <strong>Konto</strong> - zbiór zasobów i uprawnień w ramach serwisu przypisanych konkretnemu
              Użytkownikowi.
            </li>
            <li>
              <strong>Ogłoszenie</strong> - informacja zamieszczona w serwisie przez Użytkownika, zawierająca ofertę
              sprzedaży, zakupu lub wymiany towarów lub usług.
            </li>
            <li>
              <strong>Treści</strong> - wszelkie informacje, dane, teksty, oprogramowanie, zdjęcia, grafiki, wiadomości
              lub inne materiały zamieszczane przez Użytkownika w serwisie.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§3. Rejestracja i konto użytkownika</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Korzystanie z pełnej funkcjonalności serwisu wymaga utworzenia konta.</li>
            <li>Rejestracja konta jest bezpłatna i dobrowolna.</li>
            <li>Podczas rejestracji Użytkownik zobowiązany jest do podania prawdziwych danych.</li>
            <li>
              Użytkownik jest odpowiedzialny za zachowanie poufności swojego hasła i zobowiązuje się nie ujawniać hasła
              osobom trzecim.
            </li>
            <li>Użytkownik może w każdej chwili usunąć swoje konto z serwisu.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§4. Zasady publikowania ogłoszeń</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Użytkownik może publikować ogłoszenia w odpowiednich kategoriach tematycznych.</li>
            <li>Ogłoszenia muszą być zgodne z prawem polskim oraz niniejszym Regulaminem.</li>
            <li>Zabrania się publikowania ogłoszeń zawierających treści:</li>
            <ul className="list-disc pl-6 space-y-1">
              <li>naruszające prawa autorskie, prawa własności intelektualnej lub inne prawa osób trzecich;</li>
              <li>obraźliwe, wulgarne, obsceniczne lub pornograficzne;</li>
              <li>nawołujące do nienawiści, przemocy lub dyskryminacji;</li>
              <li>wprowadzające w błąd lub zawierające nieprawdziwe informacje;</li>
              <li>reklamujące produkty lub usługi niezgodne z prawem;</li>
              <li>zawierające wirusy, złośliwe oprogramowanie lub inne szkodliwe elementy.</li>
            </ul>
            <li>
              Administrator serwisu zastrzega sobie prawo do usuwania ogłoszeń naruszających Regulamin bez powiadomienia
              Użytkownika.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§5. Płatności i usługi premium</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Podstawowe korzystanie z serwisu jest bezpłatne.</li>
            <li>
              Serwis oferuje dodatkowe usługi płatne (premium), które zwiększają widoczność ogłoszeń lub oferują
              dodatkowe funkcjonalności.
            </li>
            <li>Ceny usług premium są podane w cenniku dostępnym w serwisie i zawierają podatek VAT.</li>
            <li>Płatności za usługi premium można dokonać za pomocą:</li>
            <ul className="list-disc pl-6 space-y-1">
              <li>karty płatniczej;</li>
              <li>przelewu bankowego;</li>
              <li>innych metod płatności udostępnionych w serwisie.</li>
            </ul>
            <li>Po dokonaniu płatności Użytkownik otrzyma potwierdzenie transakcji na podany adres e-mail.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§6. Odpowiedzialność</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Użytkownik ponosi pełną odpowiedzialność za treści publikowane w serwisie.</li>
            <li>Administrator serwisu nie ponosi odpowiedzialności za:</li>
            <ul className="list-disc pl-6 space-y-1">
              <li>treści publikowane przez Użytkowników;</li>
              <li>transakcje zawierane między Użytkownikami;</li>
              <li>szkody wynikłe z nieprawidłowego korzystania z serwisu;</li>
              <li>przerwy w działaniu serwisu wynikające z przyczyn technicznych;</li>
              <li>
                utratę danych spowodowaną awarią sprzętu, systemu lub innymi okolicznościami niezależnymi od
                Administratora.
              </li>
            </ul>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§7. Reklamacje</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Użytkownik ma prawo do składania reklamacji dotyczących działania serwisu.</li>
            <li>
              Reklamacje należy składać drogą elektroniczną na adres: kontakt@gotpage.pl lub pisemnie na
              adres siedziby firmy.
            </li>
            <li>Reklamacja powinna zawierać: dane Użytkownika, opis problemu oraz oczekiwany sposób rozwiązania.</li>
            <li>Reklamacje będą rozpatrywane w terminie 14 dni od daty ich otrzymania.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">§8. Postanowienia końcowe</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Administrator zastrzega sobie prawo do zmiany Regulaminu. Zmiany wchodzą w życie po upływie 7 dni od daty
              ich publikacji w serwisie.
            </li>
            <li>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.</li>
            <li>
              Wszelkie spory wynikłe z korzystania z serwisu będą rozstrzygane przez sąd właściwy dla siedziby
              Administratora.
            </li>
            <li>Regulamin wchodzi w życie z dniem 1 kwietnia 2025 roku.</li>
          </ol>
        </section>
      </div>
    </div>
  )
}

