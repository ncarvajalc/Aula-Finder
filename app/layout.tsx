import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aula-Finder - Encuentra salones disponibles | Universidad de los Andes",
  description: "Descubre en tiempo real qué salones están disponibles en el campus de la Universidad de los Andes. Anteriormente conocido como Sobrecupo. Visualiza horarios, disponibilidad por edificio y planifica tu día.",
  keywords: [
    "Aula-Finder",
    "Sobrecupo",
    "Universidad de los Andes",
    "Uniandes",
    "salones disponibles",
    "aulas libres",
    "horarios campus",
    "espacios estudio",
    "disponibilidad salones"
  ],
  authors: [{ name: "Open Source Uniandes" }],
  creator: "Open Source Uniandes",
  publisher: "Open Source Uniandes",
  metadataBase: new URL("https://open-source-uniandes.github.io"),
  alternates: {
    canonical: "/Aula-Finder",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://open-source-uniandes.github.io/Aula-Finder",
    siteName: "Aula-Finder",
    title: "Aula-Finder - Encuentra salones disponibles en Uniandes",
    description: "Descubre en tiempo real qué salones están disponibles en el campus de la Universidad de los Andes. Visualiza horarios, disponibilidad por edificio y planifica tu día.",
    images: [
      {
        url: "/Aula-Finder/seneca-singotto.png",
        width: 1417,
        height: 1984,
        alt: "Seneca - Mascota de la Universidad de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aula-Finder - Encuentra salones disponibles en Uniandes",
    description: "Descubre en tiempo real qué salones están disponibles en el campus de la Universidad de los Andes.",
    images: ["/Aula-Finder/seneca-singotto.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/Aula-Finder/favicon.ico",
    apple: "/Aula-Finder/seneca-estudiando.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
