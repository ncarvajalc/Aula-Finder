"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import WeekCalendar from "@/components/WeekCalendar";

import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-202610.json";
import { parseCourseSections, groupByRoom } from "@/lib/parse-courses";
import { getRoomRestrictions } from "@/lib/data-loader";
import { BuildingMetadata } from "@/types";

export default function ClassroomDetailClient({
  building,
  room,
}: {
  building: string;
  room: string;
}) {
  const buildingCode = building.toUpperCase();
  const roomCode = decodeURIComponent(room);

  const allBuildings = buildingsMetadata.buildings as BuildingMetadata[];
  const buildingMeta = allBuildings.find((b) => b.code === buildingCode);

  const sections = parseCourseSections(coursesData as any[]);
  const restrictions = getRoomRestrictions();
  const buildingsData = groupByRoom(sections, allBuildings, restrictions);
  const buildingData = buildingsData.find((b) => b.building === buildingCode);
  const roomData = buildingData?.rooms.find((r) => r.room === roomCode);

  if (!buildingMeta || !roomData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Salón no encontrado</h1>
          <Link href="/" className="text-uniandes-yellow underline">
            Volver a edificios
          </Link>
        </div>
      </main>
    );
  }

  const uniqueCourses = Array.from(
    new Set(roomData.occupancies.map((o) => o.courseCode))
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-uniandes-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href={`/building/${buildingCode}`}
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            ← {buildingMeta.name}
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {buildingCode} {roomCode}
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-white/70">
            <span>{roomData.occupancies.length} sesiones</span>
            <span>·</span>
            <span>{uniqueCourses.length} cursos</span>
            {roomData.floor !== undefined && (
              <>
                <span>·</span>
                <span>Piso {roomData.floor}</span>
              </>
            )}
            {roomData.isRestricted && (
              <>
                <span>·</span>
                <span>🔒 {roomData.restrictionNote}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-card border rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold mb-4">Calendario Semanal</h2>
          {roomData.occupancies.length > 0 ? (
            <WeekCalendar
              occupancies={roomData.occupancies}
              buildingCode={buildingCode}
              roomCode={roomCode}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay clases programadas para este salón.
            </div>
          )}
        </div>

        {uniqueCourses.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Cursos en este salón</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uniqueCourses.map((courseCode) => {
                const courseOccupancies = roomData.occupancies.filter(
                  (o) => o.courseCode === courseCode
                );
                const first = courseOccupancies[0];
                const days = Array.from(
                  new Set(courseOccupancies.map((o) => o.day))
                );
                const cicloLabel =
                  first.ptrm === "1"
                    ? "Semestre completo"
                    : first.ptrm === "8A"
                    ? "Ciclo 8A"
                    : first.ptrm === "8B"
                    ? "Ciclo 8B"
                    : first.ptrm;

                return (
                  <Card
                    key={courseCode}
                    className="border-l-4 border-l-uniandes-yellow"
                  >
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm">
                        {first.courseName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <div>
                          {courseCode} · Sección {first.section} · NRC{" "}
                          {first.nrc}
                        </div>
                        <div>{first.professor}</div>
                        <div>
                          {days.join(", ")} · {first.startTime}–
                          {first.endTime}
                        </div>
                        <div className="inline-block mt-1 px-2 py-0.5 rounded bg-secondary text-xs">
                          {cicloLabel}
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
