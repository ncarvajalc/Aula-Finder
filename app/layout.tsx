import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { OpenPanelComponent } from "@openpanel/nextjs";

export const metadata: Metadata = {
  title: "Aula-Finder se está despidiendo | Universidad de los Andes",
  description: "Aula-Finder está entrando en cierre. La consulta oficial de salones disponibles para estudiantes ahora continúa en la nueva plataforma institucional de la Universidad de los Andes.",
  keywords: [
    "Aula-Finder",
    "Universidad de los Andes",
    "Uniandes",
    "salones disponibles",
    "plataforma oficial",
    "cierre"
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
    title: "Aula-Finder se está despidiendo",
    description: "La consulta oficial de salones disponibles ahora continúa en la nueva plataforma institucional de la Universidad de los Andes.",
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
    title: "Aula-Finder se está despidiendo",
    description: "La consulta oficial de salones disponibles ahora continúa en la nueva plataforma institucional de la Universidad de los Andes.",
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
  manifest: "/Aula-Finder/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aula-Finder",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <OpenPanelComponent
          clientId="a73a03b1-cfa7-4cb3-912d-e4533b9f1a3c"
          trackScreenViews={true}
          trackOutgoingLinks={true}
          trackAttributes={true}
        />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
