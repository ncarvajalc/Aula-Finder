import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Aula-Finder - Universidad de los Andes",
  description: "Encuentra aulas disponibles en el campus de la Universidad de los Andes",
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
      <head>
        <link rel="apple-touch-icon" href="/Aula-Finder/icons/icon-192x192.png" />
      </head>
      <body className="font-sans antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
