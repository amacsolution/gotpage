import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Polityka Prywatności | Social Media Clone",
  description: "Polityka Prywatności serwisu Social Media Clone.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Polityka Prywatności</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-500 mb-8">Ostatnia aktualizacja: 1 kwietnia 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Wprowadzenie</h2>
          <p>
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez
            Użytkowników w związku z korzystaniem z serwisu Social Media Clone.
          </p>
          <p>
            Administratorem danych osobowych jest Gotpage z siedzibą w Warszawie, ul. Przykładowa
            123, 00-001 Warszawa, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS
            0000123456, NIP 1234567890, REGON 123456789.
          </p>
          <p>
            Administrator danych szanuje prywatność Użytkowników i dokłada wszelkich starań, aby dane osobowe były
            przetwarzane zgodnie z przepisami Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27
            kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie
            swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO) oraz ustawy z dnia 10 maja 2018
            r. o ochronie danych osobowych.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Jakie dane zbieramy</h2>
          <p>W zależności od wykorzystywanej funkcjonalności, możemy zbierać następujące dane:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Dane konta:</strong> imię, nazwisko, adres e-mail, numer telefonu, nazwa użytkownika, hasło (w
              formie zaszyfrowanej).
            </li>
            <li>
              <strong>Dane profilowe:</strong> zdjęcie profilowe, opis, lokalizacja, zainteresowania i inne informacje,
              które Użytkownik zdecyduje się udostępnić.
            </li>
            <li>
              <strong>Dane ogłoszeń:</strong> tytuł, opis, cena, kategoria, zdjęcia, lokalizacja i inne informacje
              związane z publikowanymi ogłoszeniami.
            </li>
            <li>
              <strong>Dane komunikacyjne:</strong> treść wiadomości wysyłanych między Użytkownikami, komentarze, opinie.
            </li>
            <li>
              <strong>Dane transakcyjne:</strong> informacje o płatnościach, historia zakupów usług premium.
            </li>
            <li>
              <strong>Dane techniczne:</strong> adres IP, informacje o urządzeniu, przeglądarce, systemie operacyjnym,
              dane o aktywności w serwisie.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cele i podstawy przetwarzania danych</h2>
          <p>Przetwarzamy dane osobowe Użytkowników w następujących celach:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Realizacja umowy (art. 6 ust. 1 lit. b RODO):</strong>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>Utworzenie i zarządzanie kontem Użytkownika</li>
                <li>Umożliwienie publikowania i zarządzania ogłoszeniami</li>
                <li>Umożliwienie komunikacji między Użytkownikami</li>
                <li>Realizacja płatności i usług premium</li>
              </ul>
            </li>
            <li>
              <strong>Prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO):</strong>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>Zapewnienie bezpieczeństwa serwisu i Użytkowników</li>
                <li>Wykrywanie i zapobieganie nadużyciom</li>
                <li>Analiza aktywności Użytkowników w celu poprawy jakości usług</li>
                <li>Marketing własnych produktów i usług</li>
                <li>Dochodzenie lub obrona przed roszczeniami</li>
              </ul>
            </li>
            <li>
              <strong>Zgoda Użytkownika (art. 6 ust. 1 lit. a RODO):</strong>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>Marketing produktów i usług partnerów</li>
                <li>Wykorzystanie plików cookies do celów analitycznych i marketingowych</li>
                <li>Przesyłanie informacji handlowych drogą elektroniczną</li>
              </ul>
            </li>
            <li>
              <strong>Obowiązek prawny (art. 6 ust. 1 lit. c RODO):</strong>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>Wystawianie i przechowywanie faktur oraz dokumentów księgowych</li>
                <li>Rozpatrywanie reklamacji</li>
                <li>Realizacja obowiązków podatkowych</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Okres przechowywania danych</h2>
          <p>Dane osobowe Użytkowników będą przechowywane przez następujące okresy:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dane konta i profilu - przez okres posiadania konta w serwisie oraz przez 30 dni od jego usunięcia.</li>
            <li>Dane ogłoszeń - przez okres publikacji ogłoszenia oraz 6 miesięcy po jego zakończeniu.</li>
            <li>Dane komunikacyjne - przez okres 2 lat od ostatniej wymiany wiadomości.</li>
            <li>
              Dane transakcyjne - przez okres 5 lat od zakończenia roku podatkowego, w którym dokonano transakcji.
            </li>
            <li>Dane dotyczące reklamacji - przez okres 1 roku po rozpatrzeniu reklamacji.</li>
            <li>Dane przetwarzane na podstawie zgody - do czasu wycofania zgody.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Odbiorcy danych</h2>
          <p>Dane osobowe Użytkowników mogą być przekazywane następującym kategoriom odbiorców:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Podmioty świadczące usługi hostingowe, serwisowe, administracyjne.</li>
            <li>Dostawcy systemów płatności elektronicznych.</li>
            <li>Dostawcy narzędzi analitycznych i marketingowych.</li>
            <li>Podmioty świadczące usługi wsparcia technicznego.</li>
            <li>Podmioty świadczące usługi księgowe i prawne.</li>
            <li>Organy państwowe, gdy wynika to z obowiązku prawnego.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Prawa Użytkowników</h2>
          <p>Użytkownikom przysługują następujące prawa związane z przetwarzaniem danych osobowych:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Prawo dostępu do danych.</li>
            <li>Prawo do sprostowania danych.</li>
            <li>Prawo do usunięcia danych (prawo do bycia zapomnianym).</li>
            <li>Prawo do ograniczenia przetwarzania.</li>
            <li>Prawo do przenoszenia danych.</li>
            <li>Prawo do sprzeciwu wobec przetwarzania.</li>
            <li>
              Prawo do wycofania zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania dokonanego
              przed wycofaniem zgody).
            </li>
            <li>Prawo do wniesienia skargi do organu nadzorczego (Prezes Urzędu Ochrony Danych Osobowych).</li>
          </ul>
          <p className="mt-4">
            Aby skorzystać z powyższych praw, należy skontaktować się z Administratorem poprzez e-mail:
            privacy@socialmediaclone.pl lub pisemnie na adres siedziby firmy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Pliki cookies i podobne technologie</h2>
          <p>
            Serwis wykorzystuje pliki cookies (ciasteczka) oraz podobne technologie do zbierania informacji o aktywności
            Użytkowników. Szczegółowe informacje na ten temat znajdują się w naszej{" "}
            <a href="/polityka-cookies" className="text-blue-600 hover:underline">
              Polityce Cookies
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Bezpieczeństwo danych</h2>
          <p>
            Administrator stosuje odpowiednie środki techniczne i organizacyjne, aby zapewnić bezpieczeństwo danych
            osobowych, w tym ochronę przed nieuprawnionym lub niezgodnym z prawem przetwarzaniem oraz przypadkową
            utratą, zniszczeniem lub uszkodzeniem.
          </p>
          <p>
            Środki te obejmują m.in. szyfrowanie danych, regularne testowanie i ocenę skuteczności środków
            bezpieczeństwa, szkolenia personelu oraz ograniczenie dostępu do danych osobowych.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Zmiany Polityki Prywatności</h2>
          <p>
            Administrator zastrzega sobie prawo do zmiany niniejszej Polityki Prywatności. Zmiany wchodzą w życie z
            dniem ich opublikowania w serwisie. O istotnych zmianach Polityki Prywatności Użytkownicy będą informowani
            za pośrednictwem poczty elektronicznej lub poprzez wyświetlenie odpowiedniego komunikatu w serwisie.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Kontakt</h2>
          <p>W sprawach związanych z ochroną danych osobowych można kontaktować się z Administratorem:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>E-mail: privacy@socialmediaclone.pl</li>
            <li>Adres: Social Media Clone Sp. z o.o., ul. Przykładowa 123, 00-001 Warszawa</li>
            <li>Telefon: +48 123 456 789</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

