import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, CheckCircle, MapPin, Shield, Zap, Lightbulb } from 'lucide-react'

export const metadata: Metadata = {
  title: "O serwisie | Gotpage",
  description: "Poznaj Gotpage - nowoczesną platformę ogłoszeniową, która łączy sprzedających i kupujących. Dowiedz się więcej o naszej misji, wartościach i zespole.",
  keywords: "o nas, o serwisie, misja, wartości, zespół, historia, gotpage, ogłoszenia",
}

export default function AboutPage() {
  const stats = [
    {
      title: "Użytkowników",
      value: "15K+",
      icon: <Users className="h-8 w-8 text-primary" />,
    },
    {
      title: "Aktywnych ogłoszeń",
      value: "50K+",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
    },
    {
      title: "Udanych transakcji",
      value: "5K+",
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
    },
    {
      title: "Miast w Polsce",
      value: "900+",
      icon: <MapPin className="h-8 w-8 text-primary" />,
    },
  ]

  const values = [
    {
      title: "Bezpieczeństwo",
      description: "Dbamy o bezpieczeństwo naszych użytkowników i ich danych. Stosujemy najnowsze technologie i procedury, aby zapewnić bezpieczne korzystanie z serwisu.",
      icon: <Shield className="h-10 w-10 text-primary" />,
    },
    {
      title: "Prostota",
      description: "Stawiamy na prostotę i intuicyjność. Nasz serwis jest łatwy w obsłudze, a dodawanie ogłoszeń i wyszukiwanie ofert jest proste i szybkie.",
      icon: <Zap className="h-10 w-10 text-primary" />,
    },
    {
      title: "Społeczność",
      description: "Budujemy społeczność opartą na zaufaniu i wzajemnym szacunku. Promujemy uczciwość i transparentność w relacjach między użytkownikami.",
      icon: <Users className="h-10 w-10 text-primary" />,
    },
    {
      title: "Innowacyjność",
      description: "Stale rozwijamy nasz serwis, wprowadzając nowe funkcje i ulepszenia. Słuchamy naszych użytkowników i dostosowujemy się do ich potrzeb.",
      icon: <Lightbulb className="h-10 w-10 text-primary" />,
    },
  ]

  const team = [
    {
      name: "Rafał Antoniak",
      role: "CEO & Founder",
      bio: "Rafał założył Gotpage w 2015 roku z misją stworzenia nowoczesnej platformy ogłoszeniowej, która będzie łączyć ludzi i ułatwiać im codzienne życie.",
      avatar: "/4.jpeg?placeholder.svg?height=200&width=200&text=JK",
    },
    {
      name: "Antoni Maciejowski",
      role: "Head of Marketing, Main developer",
      bio: "Antoni dba o to, aby Gotpage docierał do jak największej liczby użytkowników oraz o to jak stale poprawiać nasz system. Specjalizuje się w marketingu cyfrowym , strategiach wzrostu i programowaniu.",
      avatar: "/3.jpg?height=200&width=200&text=PW",
    },
  ]

  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">O Gotpage</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Poznaj naszą historię, misję i zespół, który stoi za Gotpage
        </p>
      </div>

      {/* Hero section */}
      <div className="relative md:h-[400px] h-[600px] rounded-xl overflow-hidden mb-12">
        <Image
          src="/pexels-jibarofoto-2014773.jpg?height=400&width=1200&text=Gotpage+Team"
          alt="Zespół Gotpage"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center">
          <div className="container">
            <div className="max-w-2xl text-white p-6">
              <h2 className="text-3xl font-bold mb-4">Łączymy ludzi i możliwości</h2>
              <p className="text-lg mb-6">
                Gotpage to nowoczesna platforma ogłoszeniowa, która łączy sprzedających i kupujących w prosty i bezpieczny sposób. Naszą misją jest ułatwianie codziennego życia poprzez umożliwienie szybkiej i wygodnej wymiany dóbr i usług.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Dołącz do nas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Nasza historia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Nasza historia</h2>
          <p className="text-lg text-muted-foreground">
            Gotpage powstał w 2015 roku jako odpowiedź na potrzebę stworzenia nowoczesnej platformy ogłoszeniowej, która będzie łączyć ludzi i ułatwiać im codzienne życie. Zaczynaliśmy jako mały startup z wielką wizją, a dziś jesteśmy jednym z wiodących serwisów ogłoszeniowych w Polsce.
          </p>
          <p className="text-lg text-muted-foreground">
            Przez lata rozwijaliśmy naszą platformę, wprowadzając nowe funkcje i ulepszenia, zawsze słuchając naszych użytkowników i dostosowując się do ich potrzeb. Naszym celem jest nieustanne doskonalenie serwisu, aby zapewnić najlepsze doświadczenia zarówno sprzedającym, jak i kupującym.
          </p>
          <p className="text-lg text-muted-foreground">
            Dziś Gotpage to nie tylko platforma ogłoszeniowa, ale także społeczność ludzi, którzy codziennie wymieniają się dobrami i usługami, pomagając sobie nawzajem i przyczyniając się do bardziej zrównoważonego stylu życia.
          </p>
        </div>

        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <Image
            src="/pexels-djordje-petrovic-590080-2102416.jpg?height=400&width=600&text=Nasza+historia"
            alt="Nasza historia"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Statystyki */}
      <div className="mt-20 bg-muted/30 py-12 px-6 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Gotpage w liczbach</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Jesteśmy dumni z naszych osiągnięć i stale rosnącej społeczności użytkowników
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-background hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    {stat.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <CardDescription className="text-base">{stat.title}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Nasze wartości */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nasze wartości</h2>
          <p className=
            "text-lg text-muted-foreground max-w-3xl mx-auto">
            W Gotpage kierujemy się wartościami, które są fundamentem naszej działalności i relacji z użytkownikami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="bg-background hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    {value.icon}
                  </div>
                </div>
                <CardTitle className="text-center">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{value.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Nasz zespół */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Poznaj nasz zespół</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Ludzie, którzy stoją za Gotpage, to doświadczeni profesjonaliści z pasją do tworzenia innowacyjnych rozwiązań.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {team.map((member, index) => (
            <Card key={index} className="bg-background hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col items-center">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={100}
                  height={100}
                  className="rounded-full mb-4"
                  style={{ objectFit: "cover", aspectRatio: "1 / 1" }}
                />
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}