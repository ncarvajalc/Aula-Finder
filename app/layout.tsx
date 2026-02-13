import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AulaFinder - Universidad de los Andes",
  description: "Find available classrooms at Universidad de los Andes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
