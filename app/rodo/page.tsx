import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Informacje RODO | Social Media Clone",
  description: "Informacje dotyczące przetwarzania danych osobowych zgodnie z RODO.",
}

export default function GDPRPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Informacje dotyczące przetwarzania danych osobowych (RODO)</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-500 mb-8">Ostatnia aktualizacja: 1 kwietnia 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Klauzula informacyjna</h2>
          <p>
            Zgodnie z art. 13 ust. 1 i 2 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia
            2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego
            przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych, dalej
            „RODO"), informujemy, że:
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Administrator danych osobowych</h2>
          <p>
            Administratorem Państwa danych osobowych jest Social Media Clone Sp. z o.o. z siedzibą w Warszawie, ul.
            Przykładowa 123, 00-001 Warszawa, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod
            numerem KRS 0000123456, NIP 1234567890, REGON 123456789, kapitał zakładowy 50 000 PLN.
          </p>
          <p>Kontakt z Administratorem jest możliwy za pośrednictwem:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>adresu e-mail: privacy@socialmediaclone.pl</li>
            <li>telefonicznie: +48 123 456 789</li>
            <li>listownie na adres siedziby Administratora</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Inspektor Ochrony Danych</h2>
          <p>
            Administrator wyznaczył Inspektora Ochrony Danych, z którym można kontaktować się we wszystkich sprawach
            dotyczących przetwarzania danych osobowych oraz korzystania z praw związanych z przetwarzaniem danych.
          </p>
          <p>Kontakt z Inspektorem Ochrony Danych jest możliwy za pośrednictwem:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>adresu e-mail: iod@socialmediaclone.pl</li>
            <li>
              listownie na adres: Inspektor Ochrony Danych, Social Media Clone Sp. z o.o., ul. Przykładowa 123, 00-001
              Warszawa
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cele i podstawy przetwarzania danych osobowych</h2>
          <p>Państwa dane osobowe będą przetwarzane w następujących celach i na następujących podstawach prawnych:</p>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Zawarcie i wykonanie umowy</strong> (art. 6 ust. 1 lit. b RODO) - w celu:
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>utworzenia i prowadzenia konta w serwisie</li>
                <li>umożliwienia publikowania i zarządzania ogłoszeniami</li>
                <li>umożliwienia komunikacji między użytkownikami serwisu</li>
                <li>realizacji płatności i usług premium</li>
                <li>obsługi reklamacji</li>
              </ul>
            </li>
            <li>
              <strong>Wypełnienie obowiązków prawnych</strong> (art. 6 ust. 1 lit. c RODO) - w celu:
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>wystawiania i przechowywania faktur oraz dokumentów księgowych</li>
                <li>realizacji obowiązków podatkowych</li>
                <li>realizacji obowiązków związanych z przeciwdziałaniem praniu pieniędzy</li>
                <li>rozpatrywania reklamacji</li>
              </ul>
            </li>
            <li>
              <strong>Prawnie uzasadnione interesy Administratora</strong> (art. 6 ust. 1 lit. f RODO) - w celu:
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>zapewnienia bezpieczeństwa serwisu i użytkowników</li>
                <li>wykrywania i zapobiegania nadużyciom</li>
                <li>analizy aktywności użytkowników w celu poprawy jakości usług</li>
                <li>marketingu własnych produktów i usług</li>
                <li>dochodzenia lub obrony przed roszczeniami</li>
                <li>prowadzenia statystyk i analiz</li>
              </ul>
            </li>
            <li>
              <strong>Zgoda</strong> (art. 6 ust. 1 lit. a RODO) - w celu:
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>marketingu produktów i usług partnerów</li>
                <li>przesyłania informacji handlowych drogą elektroniczną</li>
                <li>wykorzystania plików cookies do celów analitycznych i marketingowych</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Odbiorcy danych osobowych</h2>
          <p>Państwa dane osobowe mogą być przekazywane następującym kategoriom odbiorców:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              podmioty świadczące usługi na rzecz Administratora, takie jak dostawcy usług IT, hostingowych,
              serwisowych, administracyjnych
            </li>
            <li>dostawcy systemów płatności elektronicznych</li>
            <li>dostawcy narzędzi analitycznych i marketingowych</li>
            <li>podmioty świadczące usługi księgowe, prawne, audytowe</li>
            <li>organy państwowe lub inne podmioty uprawnione na podstawie przepisów prawa</li>
            <li>inni użytkownicy serwisu (w zakresie danych, które zdecydują się Państwo udostępnić publicznie)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Przekazywanie danych do państw trzecich</h2>
          <p>
            Co do zasady, dane osobowe nie będą przekazywane poza Europejski Obszar Gospodarczy (EOG). W przypadku
            korzystania z usług dostawców, którzy przechowują dane poza EOG (np. Google, Facebook), Administrator
            zapewnia odpowiednie zabezpieczenia, takie jak standardowe klauzule umowne zatwierdzone przez Komisję
            Europejską lub wiążące reguły korporacyjne.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Okres przechowywania danych</h2>
          <p>Państwa dane osobowe będą przechowywane przez następujące okresy:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>dane konta i profilu - przez okres posiadania konta w serwisie oraz przez 30 dni od jego usunięcia</li>
            <li>dane ogłoszeń - przez okres publikacji ogłoszenia oraz 6 miesięcy po jego zakończeniu</li>
            <li>dane komunikacyjne - przez okres 2 lat od ostatniej wymiany wiadomości</li>
            <li>dane transakcyjne - przez okres 5 lat od zakończenia roku podatkowego, w którym dokonano transakcji</li>
            <li>dane dotyczące reklamacji - przez okres 1 roku po rozpatrzeniu reklamacji</li>
            <li>dane przetwarzane na podstawie zgody - do czasu wycofania zgody</li>
            <li>
              dane przetwarzane na podstawie prawnie uzasadnionego interesu Administratora - do czasu wniesienia
              skutecznego sprzeciwu lub ustania tego interesu
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Prawa osób, których dane dotyczą</h2>
          <p>W związku z przetwarzaniem danych osobowych przysługują Państwu następujące prawa:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>prawo dostępu do danych osobowych</li>
            <li>prawo do sprostowania danych osobowych</li>
            <li>prawo do usunięcia danych osobowych (prawo do bycia zapomnianym)</li>
            <li>prawo do ograniczenia przetwarzania danych osobowych</li>
            <li>prawo do przenoszenia danych osobowych</li>
            <li>prawo do sprzeciwu wobec przetwarzania danych osobowych</li>
            <li>
              prawo do cofnięcia zgody w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania, którego
              dokonano na podstawie zgody przed jej cofnięciem (jeżeli przetwarzanie odbywa się na podstawie zgody)
            </li>
            <li>
              prawo do wniesienia skargi do organu nadzorczego (Prezes Urzędu Ochrony Danych Osobowych, ul. Stawki 2,
              00-193 Warszawa)
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Informacja o wymogu/dobrowolności podania danych</h2>
          <p>
            Podanie danych osobowych jest dobrowolne, ale niezbędne do korzystania z serwisu. Niepodanie danych
            oznaczonych jako obowiązkowe uniemożliwi rejestrację konta, publikację ogłoszeń lub korzystanie z innych
            funkcjonalności serwisu.
          </p>
          <p>
            Podanie danych w celach marketingowych jest całkowicie dobrowolne i nie wpływa na możliwość korzystania z
            serwisu.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Zautomatyzowane podejmowanie decyzji i profilowanie</h2>
          <p>
            Państwa dane osobowe mogą być przetwarzane w sposób zautomatyzowany, w tym również w formie profilowania, w
            celu dostosowania zawartości serwisu do Państwa preferencji oraz optymalizacji treści. Profilowanie może
            obejmować analizę aktywności w serwisie, historię ogłoszeń i wyszukiwań, aby dostarczać bardziej trafne
            wyniki wyszukiwania i rekomendacje.
          </p>
          <p>
            Zautomatyzowane podejmowanie decyzji może być również stosowane w celu wykrywania nadużyć i zapewnienia
            bezpieczeństwa serwisu.
          </p>
        </section>
      </div>
    </div>
  )
}

