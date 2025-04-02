import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Polityka Cookies | Social Media Clone",
  description: "Polityka Cookies serwisu Social Media Clone.",
}

export default function CookiesPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Polityka Cookies</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-500 mb-8">Ostatnia aktualizacja: 1 kwietnia 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Czym są pliki cookies?</h2>
          <p>
            Pliki cookies (tzw. "ciasteczka") to małe pliki tekstowe, które są zapisywane na urządzeniu końcowym
            Użytkownika (komputerze, tablecie, smartfonie) podczas przeglądania stron internetowych. Pliki te zawierają
            informacje, które są niezbędne do prawidłowego funkcjonowania serwisu internetowego.
          </p>
          <p>
            Pliki cookies nie zawierają złośliwego oprogramowania, wirusów ani innych szkodliwych kodów. Nie umożliwiają
            również dostępu do prywatnych danych znajdujących się na urządzeniu Użytkownika.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Rodzaje plików cookies</h2>
          <p>W naszym serwisie wykorzystujemy następujące rodzaje plików cookies:</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.1. Ze względu na czas przechowywania:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Sesyjne</strong> - pliki tymczasowe, które są przechowywane na urządzeniu Użytkownika do momentu
              wylogowania, opuszczenia strony internetowej lub zamknięcia przeglądarki.
            </li>
            <li>
              <strong>Stałe</strong> - pliki przechowywane na urządzeniu Użytkownika przez określony czas lub do momentu
              ich ręcznego usunięcia przez Użytkownika.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2. Ze względu na cel:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Niezbędne</strong> - pliki cookies konieczne do prawidłowego funkcjonowania serwisu, umożliwiające
              korzystanie z jego podstawowych funkcji, takich jak logowanie, zapamiętywanie preferencji Użytkownika czy
              zapewnienie bezpieczeństwa.
            </li>
            <li>
              <strong>Funkcjonalne</strong> - pliki cookies umożliwiające zapamiętanie wybranych przez Użytkownika
              ustawień i personalizację interfejsu, np. w zakresie wybranego języka, rozmiaru czcionki, wyglądu strony
              internetowej.
            </li>
            <li>
              <strong>Analityczne</strong> - pliki cookies służące do zbierania informacji o sposobie korzystania z
              serwisu przez Użytkowników, które pomagają nam zrozumieć, w jaki sposób Użytkownicy korzystają z serwisu,
              co umożliwia ulepszanie jego struktury i zawartości.
            </li>
            <li>
              <strong>Marketingowe</strong> - pliki cookies wykorzystywane do śledzenia aktywności Użytkowników w
              Internecie w celu dostarczania spersonalizowanych reklam.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.3. Ze względu na pochodzenie:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Własne</strong> - pliki cookies umieszczane przez nasz serwis.
            </li>
            <li>
              <strong>Zewnętrzne</strong> - pliki cookies umieszczane przez podmioty trzecie, których komponenty są
              osadzone w naszym serwisie.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cele wykorzystania plików cookies</h2>
          <p>Pliki cookies są wykorzystywane w naszym serwisie w następujących celach:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Zapewnienie prawidłowego działania serwisu i jego funkcjonalności.</li>
            <li>Dostosowanie zawartości serwisu do preferencji Użytkownika.</li>
            <li>Zapamiętywanie ustawień i wyborów Użytkownika.</li>
            <li>Utrzymanie sesji Użytkownika po zalogowaniu.</li>
            <li>Tworzenie statystyk, które pomagają zrozumieć, w jaki sposób Użytkownicy korzystają z serwisu.</li>
            <li>Analiza aktywności Użytkowników w celu poprawy jakości usług.</li>
            <li>Dostarczanie spersonalizowanych reklam.</li>
            <li>Zapewnienie bezpieczeństwa i wykrywanie nadużyć.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Pliki cookies podmiotów trzecich</h2>
          <p>W naszym serwisie mogą być wykorzystywane pliki cookies następujących podmiotów trzecich:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Google Analytics</strong> - narzędzie analityczne dostarczane przez Google LLC, które pomaga nam
              zrozumieć, w jaki sposób Użytkownicy korzystają z serwisu. Więcej informacji na temat plików cookies
              Google Analytics można znaleźć na stronie:{" "}
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://policies.google.com/privacy
              </a>
            </li>
            <li>
              <strong>Facebook Pixel</strong> - narzędzie analityczne i marketingowe dostarczane przez Meta Platforms,
              Inc., które pomaga nam mierzyć skuteczność reklam i lepiej zrozumieć działania Użytkowników. Więcej
              informacji na temat plików cookies Facebook można znaleźć na stronie:{" "}
              <a
                href="https://www.facebook.com/policies/cookies/"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.facebook.com/policies/cookies/
              </a>
            </li>
            <li>
              <strong>Stripe</strong> - dostawca usług płatniczych, który wykorzystuje pliki cookies do przetwarzania
              płatności i zapobiegania oszustwom. Więcej informacji na temat plików cookies Stripe można znaleźć na
              stronie:{" "}
              <a
                href="https://stripe.com/cookies-policy/legal"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://stripe.com/cookies-policy/legal
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Zarządzanie plikami cookies</h2>
          <p>
            Użytkownik może w każdej chwili zmienić ustawienia dotyczące plików cookies za pomocą ustawień przeglądarki
            internetowej. Szczegółowe informacje o możliwości i sposobach obsługi plików cookies dostępne są w
            ustawieniach przeglądarki internetowej.
          </p>
          <p>
            Poniżej znajdują się linki do informacji o zarządzaniu plikami cookies w najpopularniejszych przeglądarkach:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647?hl=pl"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/pl/kb/ciasteczka"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/pl-pl/microsoft-edge/usuwanie-plik%C3%B3w-cookie-w-przegl%C4%85darce-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Edge
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://help.opera.com/pl/latest/web-preferences/#cookies"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Opera
              </a>
            </li>
          </ul>
          <p className="mt-4">
            Ograniczenie stosowania plików cookies może wpłynąć na niektóre funkcjonalności dostępne w naszym serwisie.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Zmiany Polityki Cookies</h2>
          <p>
            Zastrzegamy sobie prawo do zmiany niniejszej Polityki Cookies. Zmiany wchodzą w życie z dniem ich
            opublikowania w serwisie.
          </p>
        </section>
      </div>
    </div>
  )
}

