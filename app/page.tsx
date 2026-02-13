import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-bold">
          AulaFinder
        </h1>
        <p className="text-xl text-muted-foreground">
          Encuentra aulas disponibles en la Universidad de los Andes
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link href="/buildings">
            <Button size="lg" className="w-full sm:w-auto">
              🏢 Explorar Edificios
            </Button>
          </Link>
        </div>

        <div className="bg-secondary p-8 rounded-lg mt-8">
          <h2 className="text-lg font-semibold mb-4">✨ Funcionalidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div>
              <h3 className="font-semibold mb-2">🏢 Edificios</h3>
              <p className="text-sm text-muted-foreground">
                Explora edificios del campus con información de servicios, coordenadas y fotos
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🗂️ Aulas</h3>
              <p className="text-sm text-muted-foreground">
                Navega por aulas organizadas por piso, con información de restricciones
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📅 Calendarios</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza horarios semanales de ocupación con detalles de cada curso
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg text-sm">
          <p className="text-muted-foreground">
            <strong>Fase 3 completa:</strong> UI screens con datos editables en JSON. 
            Los datos se pueden actualizar fácilmente en los archivos data/*.json
          </p>
        </div>
      </div>
    </main>
  );
}
