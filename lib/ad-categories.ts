// Centralized categories configuration for the application
export const categories = [
  {
    id: 1,
    name: "Motoryzacja",
    subcategories: ["Samochody osobowe", "Motocykle", "Części", "Przyczepy", "Ciężarowe", "Inne pojazdy"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: true, dbField: "make" },
      { name: "model", label: "Model", type: "text", required: true, dbField: "model" },
      { name: "rok", label: "Rok produkcji", type: "number", required: true, dbField: "year" },
      { name: "przebieg", label: "Przebieg (km)", type: "number", required: false, dbField: "mileage" },
      { name: "pojemnosc", label: "Pojemność silnika (cm³)", type: "number", required: false, dbField: "engine_size" },
      {
        name: "paliwo",
        label: "Rodzaj paliwa",
        type: "select",
        options: ["Benzyna", "Diesel", "LPG", "Elektryczny", "Hybryda"],
        required: false,
        dbField: "fuel_type",
      },
      {
        name: "skrzynia",
        label: "Skrzynia biegów",
        type: "select",
        options: ["Manualna", "Automatyczna"],
        required: false,
        dbField: "transmission",
      },
    ],
  },
  {
    id: 2,
    name: "Nieruchomości",
    subcategories: ["Mieszkania", "Domy", "Działki", "Biura", "Garaże", "Pokoje"],
    fields: [
      { name: "powierzchnia", label: "Powierzchnia (m²)", type: "number", required: true, dbField: "square_meters" },
      { name: "liczba_pokoi", label: "Liczba pokoi", type: "number", required: false, dbField: "rooms" },
      { name: "pietro", label: "Piętro", type: "number", required: false, dbField: "floor" },
      { name: "rok_budowy", label: "Rok budowy", type: "number", required: false, dbField: "year_built" },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Bardzo dobry", "Dobry", "Do remontu"],
        required: false,
        dbField: "heating_type", // Używamy heating_type do przechowywania stanu
      },
      { name: "umeblowane", label: "Umeblowane", type: "checkbox", required: false, dbField: "has_balcony" }, // Używamy has_balcony do przechowywania informacji o umeblowaniu
    ],
  },
  {
    id: 3,
    name: "Elektronika",
    subcategories: ["Telefony", "Komputery", "RTV", "Konsole", "Fotografia", "Akcesoria"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: true, dbField: "brand" },
      { name: "model", label: "Model", type: "text", required: true, dbField: "model" },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Używany - jak nowy", "Używany - dobry", "Używany - widoczne ślady użytkowania"],
        required: false,
        dbField: "condition_type",
      },
      { name: "gwarancja", label: "Gwarancja", type: "checkbox", required: false, dbField: "warranty_months" },
    ],
  },
  {
    id: 4,
    name: "Moda",
    subcategories: ["Ubrania", "Buty", "Dodatki", "Biżuteria", "Torebki", "Zegarki"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: false, dbField: "brand" },
      { name: "rozmiar", label: "Rozmiar", type: "text", required: true, dbField: "size" },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Używany - jak nowy", "Używany - dobry", "Używany - widoczne ślady użytkowania"],
        required: false,
        dbField: "condition_type",
      },
      { name: "kolor", label: "Kolor", type: "text", required: false, dbField: "color" },
      { name: "material", label: "Materiał", type: "text", required: false, dbField: "material" },
    ],
  },
  {
    id: 5,
    name: "Usługi",
    subcategories: ["Remonty", "Transport", "Korepetycje", "Sprzątanie", "Ogrodnicze", "Finansowe"],
    fields: [
      { name: "doswiadczenie", label: "Doświadczenie (lata)", type: "number", required: false, dbField: "job_type" },
      { name: "dostepnosc", label: "Dostępność", type: "text", required: false, dbField: "availability" },
      { name: "dojazd", label: "Możliwość dojazdu", type: "checkbox", required: false, dbField: "has_garage" }, // Używamy has_garage do przechowywania informacji o możliwości dojazdu
    ],
  },
  {
    id: 6,
    name: "Praca",
    subcategories: ["Etaty", "Freelance", "Zdalna", "Dorywcza", "Sezonowa"],
    fields: [
      { name: "stanowisko", label: "Stanowisko", type: "text", required: true, dbField: "position" },
      { name: "firma", label: "Firma", type: "text", required: false, dbField: "company" },
      { name: "rodzaj_umowy", label: "Rodzaj umowy", type: "select", options: ["Umowa o pracę", "Zlecenie", "Dzieło", "B2B"], required: false, dbField: "contract_type" },
      { name: "wynagrodzenie", label: "Wynagrodzenie (PLN)", type: "number", required: false, dbField: "salary" },
      { name: "lokalizacja", label: "Lokalizacja", type: "text", required: false, dbField: "location" }
    ]
  },
  {
    id: 7,
    name: "Zwierzęta",
    subcategories: ["Psy", "Koty", "Ptaki", "Gryzonie", "Ryby", "Akcesoria"],
    fields: [
      { name: "gatunek", label: "Gatunek", type: "text", required: true, dbField: "species" },
      { name: "rasa", label: "Rasa", type: "text", required: false, dbField: "breed" },
      { name: "wiek", label: "Wiek (lata)", type: "number", required: false, dbField: "age" },
      { name: "szczepienia", label: "Szczepienia", type: "checkbox", required: false, dbField: "vaccinated" }
    ]
  },
  {
    id: 8,
    name: "Sport i Hobby",
    subcategories: ["Rowery", "Fitness", "Wędkarstwo", "Instrumenty", "Kolekcje"],
    fields: [
      { name: "typ", label: "Typ", type: "text", required: true, dbField: "type" },
      { name: "marka", label: "Marka", type: "text", required: false, dbField: "brand" },
      { name: "stan", label: "Stan", type: "select", options: ["Nowy", "Używany"], required: false, dbField: "condition" }
    ]
  },
  {
    id: 9,
    name: "Dla dzieci",
    subcategories: ["Zabawki", "Wózki", "Ubrania", "Foteliki", "Meble dziecięce"],
    fields: [
      { name: "wiek", label: "Wiek dziecka (lata)", type: "number", required: false, dbField: "child_age" },
      { name: "marka", label: "Marka", type: "text", required: false, dbField: "brand" },
      { name: "kolor", label: "Kolor", type: "text", required: false, dbField: "color" }
    ]
  },
  {
    id: 10,
    name: "Rolnictwo",
    subcategories: ["Maszyny rolnicze", "Zwierzęta hodowlane", "Nawozy", "Zboża", "Usługi rolnicze"],
    fields: [
      { name: "typ", label: "Typ", type: "text", required: true, dbField: "type" },
      { name: "rok", label: "Rok produkcji", type: "number", required: false, dbField: "year" },
      { name: "moc", label: "Moc (KM)", type: "number", required: false, dbField: "power" }
    ]
  }
]

// Helper function to find a category by name
export function getCategoryByName(name: string) {
  return categories.find(category => category.name === name);
}

// Helper function to get all category names
export function getCategoryNames() {
  return categories.map(category => category.name);
}

// Helper function to get subcategories for a category
export function getSubcategories(categoryName: string) {
  const category = getCategoryByName(categoryName);
  return category ? category.subcategories : [];
}

// Helper function to get fields for a category
export function getCategoryFields(categoryName: string) {
  const category = getCategoryByName(categoryName);
  return category ? category.fields : [];
}
