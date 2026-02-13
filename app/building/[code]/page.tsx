import { getBuildingByCode, getRoomRestrictions, getAmenitiesByBuildingCode, getBuildingMetadata } from "@/lib/data-loader";
import { parseCourseSections, groupByRoom } from "@/lib/parse-courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomData } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import coursesData from "@/data/courses/courses-202610.json";

interface Props {
  params: Promise<{ code: string }>;
}

// Generate static params for all buildings
export async function generateStaticParams() {
  const buildings = getBuildingMetadata();
  return buildings.map((building) => ({
    code: building.code,
  }));
}

export default async function BuildingDetailPage({ params }: Props) {
  const { code } = await params;
  const buildingCode = code.toUpperCase();
  
  // Get building metadata
  const building = getBuildingByCode(buildingCode);
  if (!building) {
    notFound();
  }

  // Get amenities
  const amenities = getAmenitiesByBuildingCode(buildingCode);

  // Parse course data
  const sections = parseCourseSections(coursesData);
  const buildingsData = groupByRoom(sections, [building], getRoomRestrictions());
  const buildingData = buildingsData.find(b => b.building === buildingCode);

  // Group rooms by floor
  const roomsByFloor = new Map<number, RoomData[]>();
  if (buildingData) {
    buildingData.rooms.forEach((room) => {
      const floor = room.floor ?? 0;
      if (!roomsByFloor.has(floor)) {
        roomsByFloor.set(floor, []);
      }
      roomsByFloor.get(floor)!.push(room);
    });
  }

  // Sort floors in descending order
  const sortedFloors = Array.from(roomsByFloor.keys()).sort((a, b) => b - a);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/buildings" className="text-sm text-muted-foreground hover:underline mb-2 inline-block">
            ← Volver a edificios
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            {building.name} <span className="text-muted-foreground">({building.code})</span>
          </h1>
          <p className="text-muted-foreground">{building.campus}</p>
        </div>

        {/* Building Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Edificio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coordinates */}
              {building.coordinates && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">📍 Coordenadas</h3>
                  <p className="text-sm text-muted-foreground">
                    {building.coordinates.latitude.toFixed(6)}, {building.coordinates.longitude.toFixed(6)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${building.coordinates.latitude},${building.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">🏢 Servicios y Amenidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs"
                        title={amenity.description || amenity.location || amenity.name}
                      >
                        {amenity.icon && <span>{amenity.icon}</span>}
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classrooms by Floor */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Aulas</h2>
          
          {sortedFloors.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  No hay datos de aulas disponibles para este edificio en el semestre actual.
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedFloors.map((floor) => {
              const rooms = roomsByFloor.get(floor)!;
              return (
                <div key={floor}>
                  <h3 className="text-xl font-semibold mb-3">
                    Piso {floor}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rooms.map((room) => (
                      <Link
                        key={room.room}
                        href={`/classroom/${buildingCode}/${room.room}`}
                      >
                        <Card 
                          className={`transition-all hover:shadow-lg hover:scale-[1.02] ${
                            room.isRestricted ? 'bg-muted/50' : ''
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <span>{room.room}</span>
                              {room.isRestricted && (
                                <span className="text-xs text-muted-foreground" title={room.restrictionNote}>
                                  🔒
                                </span>
                              )}
                            </CardTitle>
                            {room.isRestricted && room.restrictionNote && (
                              <CardDescription className="text-xs">
                                {room.restrictionNote}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm text-muted-foreground">
                              {room.occupancies.length > 0 ? (
                                <>
                                  <span className="font-semibold">{room.occupancies.length}</span> clases programadas
                                </>
                              ) : (
                                <span>Sin clases programadas</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Help Box */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">ℹ️ Información</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Las aulas con 🔒 tienen restricciones de acceso (laboratorios, oficinas, etc.).
          </p>
          <p className="text-sm text-muted-foreground">
            Haz clic en cualquier aula para ver su calendario semanal con horarios de ocupación.
          </p>
        </div>
      </div>
    </main>
  );
}
