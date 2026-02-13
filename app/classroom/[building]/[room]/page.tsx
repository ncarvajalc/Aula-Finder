import { getBuildingByCode, getRoomRestrictions, getBuildingMetadata } from "@/lib/data-loader";
import { parseCourseSections, groupByRoom } from "@/lib/parse-courses";
import WeekCalendar from "@/components/WeekCalendar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import coursesData from "@/data/courses/courses-202610.json";

interface Props {
  params: Promise<{ building: string; room: string }>;
}

// Generate static params for all classrooms
export async function generateStaticParams() {
  const buildings = getBuildingMetadata();
  const sections = parseCourseSections(coursesData);
  const buildingsData = groupByRoom(sections, buildings, getRoomRestrictions());
  
  const params: { building: string; room: string }[] = [];
  buildingsData.forEach(buildingData => {
    buildingData.rooms.forEach(room => {
      params.push({
        building: buildingData.building,
        room: room.room,
      });
    });
  });
  
  return params;
}

export default async function ClassroomDetailPage({ params }: Props) {
  const { building, room } = await params;
  const buildingCode = building.toUpperCase();
  const roomCode = room.toUpperCase();

  // Get building metadata
  const buildingMetadata = getBuildingByCode(buildingCode);
  if (!buildingMetadata) {
    notFound();
  }

  // Parse course data
  const sections = parseCourseSections(coursesData);
  const buildingsData = groupByRoom(sections, [buildingMetadata], getRoomRestrictions());
  const buildingData = buildingsData.find(b => b.building === buildingCode);
  
  if (!buildingData) {
    notFound();
  }

  // Find the specific room
  const roomData = buildingData.rooms.find(r => r.room === roomCode);
  if (!roomData) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/building/${buildingCode}`}
            className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
          >
            ← Volver a {buildingMetadata.name}
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            {buildingMetadata.name} - Aula {roomCode}
          </h1>
          <p className="text-muted-foreground">
            {buildingCode} {roomCode}
            {roomData.isRestricted && (
              <span className="ml-2 text-sm">🔒 {roomData.restrictionNote}</span>
            )}
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{roomData.occupancies.length}</div>
                <div className="text-sm text-muted-foreground">Sesiones de clase</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(roomData.occupancies.map(o => o.courseCode)).size}
                </div>
                <div className="text-sm text-muted-foreground">Cursos únicos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {roomData.floor !== undefined ? `Piso ${roomData.floor}` : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Ubicación</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Section */}
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Calendario Semanal</h2>
            <p className="text-sm text-muted-foreground">
              Horario de ocupación: 6:00 - 22:00. Haz clic en cualquier bloque para ver detalles del curso.
            </p>
          </div>
          
          {roomData.occupancies.length > 0 ? (
            <WeekCalendar
              occupancies={roomData.occupancies}
              buildingCode={buildingCode}
              roomCode={roomCode}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay clases programadas para este salón en el semestre actual.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-semibold mb-2">ℹ️ Leyenda</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Los bloques de color representan sesiones de clase</li>
            <li>• La línea roja indica la hora actual (se actualiza automáticamente)</li>
            <li>• Haz clic en cualquier bloque para ver información detallada del curso</li>
            <li>• Los colores diferentes ayudan a distinguir entre cursos</li>
          </ul>
        </div>

        {/* Course List */}
        {roomData.occupancies.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Cursos en este salón</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(new Set(roomData.occupancies.map(o => o.courseCode))).map((courseCode) => {
                const courseOccupancies = roomData.occupancies.filter(o => o.courseCode === courseCode);
                const firstOccupancy = courseOccupancies[0];
                return (
                  <Card key={courseCode}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-1">{firstOccupancy.courseName}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{courseCode} - Sección {firstOccupancy.section}</div>
                        <div>Profesor: {firstOccupancy.professor}</div>
                        <div>NRC: {firstOccupancy.nrc}</div>
                        <div>
                          Sesiones: {courseOccupancies.length} 
                          {" "}({courseOccupancies.map(o => o.day).join(", ")})
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
