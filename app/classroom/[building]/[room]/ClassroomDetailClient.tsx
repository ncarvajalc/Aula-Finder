"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import WeekCalendar from "@/components/WeekCalendar";

import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-latest.json";
import ciclosData from "@/data/ciclos.json";
import manifestData from "@/data/courses/manifest.json";
import { parseCourseSections, groupByRoom, getCurrentCiclo } from "@/lib/parse-courses";
import { getRoomRestrictions } from "@/lib/data-loader";
import { withConfigParam } from "@/lib/query-utils";
import { BuildingMetadata, PartOfTerm } from "@/types";

export default function ClassroomDetailClient({
  building,
  room,
}: {
  building: string;
  room: string;
}) {
  return (
    <Suspense>
      <ClassroomDetailInner building={building} room={room} />
    </Suspense>
  );
}

function ClassroomDetailInner({
  building,
  room,
}: {
  building: string;
  room: string;
}) {
  const searchParams = useSearchParams();
  const buildingCode = building.toUpperCase();
  const roomCode = decodeURIComponent(room);

  // Determine default ciclo from URL or auto-detect
  const urlCiclo = searchParams.get("ciclo");
  const defaultCiclo = (urlCiclo && ["all", "1", "8A", "8B"].includes(urlCiclo))
    ? urlCiclo as PartOfTerm | "all"
    : getCurrentCiclo(manifestData.term, ciclosData);

  const [selectedCiclo, setSelectedCiclo] = useState<PartOfTerm | "all">(defaultCiclo);

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

  // Filter occupancies by selected ciclo
  const filteredOccupancies = selectedCiclo === "all"
    ? roomData.occupancies
    : roomData.occupancies.filter((o) => o.ptrm === selectedCiclo || o.ptrm === "1");

  const uniqueCourses = Array.from(
    new Set(filteredOccupancies.map((o) => o.courseCode))
  );

  // Check if there are multiple ciclos in this room's data
  const availableCiclos = Array.from(new Set(roomData.occupancies.map((o) => o.ptrm)));
  const hasCicloVariety = availableCiclos.length > 1 || availableCiclos.some((c) => c === "8A" || c === "8B");

  // Preserve time params in back link
  const qs = searchParams.toString();
  const backQuery = qs ? `?${qs}` : "";
  const settingsHref = `/${withConfigParam(backQuery)}`;

  /**
   * Check if a course title indicates it's in English.
   * Courses with "INGLÉS" or "INGLES" in the title are taught in English.
   */
  function isEnglishCourse(courseName: string): boolean {
    const upper = courseName.toUpperCase();
    return upper.includes("INGLÉS") || upper.includes("INGLES");
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-uniandes-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-start justify-between">
          <div>
            <Link
              href={`/building/${buildingCode}${backQuery}`}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              ← {buildingMeta.name}
            </Link>
            <h1 className="text-2xl font-bold mt-2">
              {buildingCode} {roomCode}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-white/70">
              <span>{filteredOccupancies.length} sesiones</span>
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
          <div className="flex items-center gap-2">
            <Link
              href={`/map${backQuery}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8 text-white hover:bg-white/10 transition-colors"
              title="Mapa del campus"
              aria-label="Ver mapa del campus"
            >
              🗺️
            </Link>
            <Link
              href="https://dashboard.openpanel.dev/share/overview/hQ9bOd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8 text-white hover:bg-white/10 transition-colors"
              title="Ver analíticas"
              aria-label="Ver analíticas de OpenPanel"
            >
              📊
            </Link>
            <Link
              href={settingsHref}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8 text-white hover:bg-white/10 transition-colors"
              title="Abrir configuración"
              aria-label="Abrir configuración"
            >
              ⚙️
            </Link>
          </div>
        </div>
      </header>

      {/* Ciclo filter */}
      {hasCicloVariety && (
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ciclo:</span>
              <select
                value={selectedCiclo}
                onChange={(e) => setSelectedCiclo(e.target.value as PartOfTerm | "all")}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm"
              >
                <option value="all">Todos los ciclos</option>
                <option value="1">Semestre completo</option>
                <option value="8A">Ciclo 8A (1ª mitad)</option>
                <option value="8B">Ciclo 8B (2ª mitad)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-card border rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold mb-4">Calendario Semanal</h2>
          {filteredOccupancies.length > 0 ? (
            <WeekCalendar
              occupancies={filteredOccupancies}
              buildingCode={buildingCode}
              roomCode={roomCode}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay clases programadas para este salón en el ciclo seleccionado.
            </div>
          )}
        </div>

        {uniqueCourses.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Cursos en este salón</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uniqueCourses.map((courseCode) => {
                const courseOccupancies = filteredOccupancies.filter(
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

                const isEnglish = isEnglishCourse(first.courseName);

                return (
                  <Card
                    key={courseCode}
                    className="border-l-4 border-l-uniandes-yellow"
                  >
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {first.courseName}
                        {isEnglish && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                            🇬🇧 EN
                          </span>
                        )}
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
