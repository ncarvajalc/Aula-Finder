import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getAssetPath } from "@/lib/utils";
import { SUNSET_CONTENT } from "@/lib/sunset-content";

type SunsetPlaceholderProps = {
  className?: string;
};

export default function SunsetPlaceholder({ className = "" }: SunsetPlaceholderProps) {
  return (
    <main className={`min-h-screen bg-background ${className}`.trim()}>
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full shadow-none">
          <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center rounded-lg border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                {SUNSET_CONTENT.badge}
              </div>

              <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-uniandes-dark sm:text-5xl">
                {SUNSET_CONTENT.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-foreground sm:text-lg">
                {SUNSET_CONTENT.message}
              </p>

              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {SUNSET_CONTENT.supportingText}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={SUNSET_CONTENT.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-uniandes-dark px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-uniandes-dark/90 sm:text-base"
                >
                  {SUNSET_CONTENT.ctaLabel}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card px-4 py-4 text-center text-xs text-muted-foreground">
                <div>
                  Este proyecto hace parte de la historia de Open Source Uniandes y su repositorio permanece disponible.
                </div>
                <div className="mt-1">
                  Si quieres ver el código fuente, visita el{" "}
                  <a
                    href="https://github.com/Open-Source-Uniandes/Aula-Finder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-uniandes-dark underline"
                  >
                    repositorio en GitHub.
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
