import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AulaFinder - Universidad de los Andes",
  description: "Encuentra aulas disponibles en el campus de la Universidad de los Andes",
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
