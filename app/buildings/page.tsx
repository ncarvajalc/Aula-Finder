import { getWhitelistedBuildingsWithAmenities } from "@/lib/data-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function BuildingsPage() {
  const buildings = getWhitelistedBuildingsWithAmenities();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edificios</h1>
          <p className="text-muted-foreground">
            Explora los edificios del campus y encuentra aulas disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <Link
              key={building.code}
              href={`/building/${building.code}`}
              className="group"
            >
              <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                {/* Building Image */}
                <div className="relative h-48 w-full bg-muted">
                  {building.imageUrl ? (
                    <Image
                      src={building.imageUrl}
                      alt={building.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl font-bold text-muted-foreground">
                      {building.code}
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{building.name}</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {building.code}
                    </span>
                  </CardTitle>
                  <CardDescription>{building.campus}</CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Coordinates */}
                  {building.coordinates && (
                    <div className="mb-3 text-xs text-muted-foreground">
                      📍 {building.coordinates.latitude.toFixed(6)}, {building.coordinates.longitude.toFixed(6)}
                    </div>
                  )}

                  {/* Amenities */}
                  {building.amenities && building.amenities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Servicios</h4>
                      <div className="flex flex-wrap gap-2">
                        {building.amenities.slice(0, 4).map((amenity, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs"
                            title={amenity.description || amenity.name}
                          >
                            {amenity.icon && <span>{amenity.icon}</span>}
                            <span className="hidden sm:inline">{amenity.name}</span>
                          </div>
                        ))}
                        {building.amenities.length > 4 && (
                          <div className="inline-flex items-center px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                            +{building.amenities.length - 4} más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Information Box */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">ℹ️ Información</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Los datos de servicios y coordenadas se mantienen manualmente en archivos JSON.
          </p>
          <p className="text-sm text-muted-foreground">
            ¿Encontraste información incorrecta? Puedes contribuir actualizando los archivos en{" "}
            <code className="px-1 py-0.5 bg-background rounded">data/buildings-metadata.json</code> y{" "}
            <code className="px-1 py-0.5 bg-background rounded">data/buildings-amenities.json</code>
          </p>
        </div>
      </div>
    </main>
  );
}
