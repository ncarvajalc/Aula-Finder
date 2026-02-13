"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RoomData, PartOfTerm, DayOfWeek, BuildingMetadata } from "@/types";
import Link from "next/link";

import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-202610.json";
import manifestData from "@/data/courses/manifest.json";
import ciclosData from "@/data/ciclos.json";
import { parseCourseSections, groupByRoom, getCurrentCiclo } from "@/lib/parse-courses";
import { getRoomRestrictions } from "@/lib/data-loader";

const DAY_NAMES: Record<string, string> = {
  L: "Lunes", M: "Martes", I: "Miércoles", J: "Jueves", V: "Viernes", S: "Sábado",
};
const DAY_ORDER: DayOfWeek[] = ["L", "M", "I", "J", "V", "S"];

function getCurrentDayCode(): DayOfWeek {
  const dayIndex = new Date().getDay();
  const map: DayOfWeek[] = ["D", "L", "M", "I", "J", "V", "S"];
  return map[dayIndex] || "L";
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// Classes end 10 minutes early to allow students to move between classrooms
const CLASS_TRANSITION_MINUTES = 10;

export default function BuildingDetailClient({ code }: { code: string }) {
  const buildingCode = code.toUpperCase();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayCode());
  const [selectedTime, setSelectedTime] = useState<string>(getCurrentTime());
  const [isAutoTime, setIsAutoTime] = useState(true);
  const [selectedCiclo, setSelectedCiclo] = useState<PartOfTerm | "all">(() => getCurrentCiclo(manifestData.term, ciclosData));

  useEffect(() => {
    if (!isAutoTime) return;
    const interval = setInterval(() => {
      setSelectedDay(getCurrentDayCode());
      setSelectedTime(getCurrentTime());
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoTime]);

  const allBuildings = buildingsMetadata.buildings as BuildingMetadata[];
  const building = allBuildings.find((b) => b.code === buildingCode);

  if (!building) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Edificio no encontrado</h1>
          <Link href="/buildings" className="text-uniandes-yellow underline">Volver a edificios</Link>
        </div>
      </main>
    );
  }

  const sections = parseCourseSections(coursesData as any[]);
  const restrictions = getRoomRestrictions();
  const buildingsData = groupByRoom(sections, allBuildings, restrictions);
  const buildingData = buildingsData.find((b) => b.building === buildingCode);

  const roomsByFloor = new Map<number, RoomData[]>();
  if (buildingData) {
    buildingData.rooms.forEach((room) => {
      const floor = room.floor ?? 0;
      if (!roomsByFloor.has(floor)) roomsByFloor.set(floor, []);
      roomsByFloor.get(floor)!.push(room);
    });
  }

  const sortedFloors = Array.from(roomsByFloor.keys()).sort((a, b) => a - b);

  function getRoomStatus(room: RoomData) {
    if (room.isRestricted) return { status: "restricted" as const, label: room.restrictionNote || "Restringido", sublabel: undefined };

    const dayOccupancies = room.occupancies.filter((occ) => {
      if (occ.day !== selectedDay) return false;
      if (selectedCiclo !== "all" && occ.ptrm !== selectedCiclo && occ.ptrm !== "1") return false;
      return true;
    });

    const current = dayOccupancies.find((occ) => selectedTime >= occ.startTime && selectedTime < occ.endTime);
    if (current) {
      return { status: "occupied" as const, label: `${current.courseCode} · ${current.courseName}`, sublabel: `Hasta las ${current.endTime}` };
    }

    const previous = dayOccupancies.filter((occ) => occ.endTime <= selectedTime).sort((a, b) => b.endTime.localeCompare(a.endTime))[0];
    if (previous) {
      const [ph, pm] = previous.endTime.split(":").map(Number);
      const [sh, sm] = selectedTime.split(":").map(Number);
      if ((sh * 60 + sm) - (ph * 60 + pm) < CLASS_TRANSITION_MINUTES) {
        return { status: "gap" as const, label: "En cambio de clase", sublabel: `Clase terminó a las ${previous.endTime}` };
      }
    }

    const next = dayOccupancies.filter((occ) => occ.startTime > selectedTime).sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    if (next) {
      const [nh, nm] = next.startTime.split(":").map(Number);
      const [sh, sm] = selectedTime.split(":").map(Number);
      if ((nh * 60 + nm) - (sh * 60 + sm) < CLASS_TRANSITION_MINUTES) {
        return { status: "gap" as const, label: "Próxima clase en minutos", sublabel: `${next.courseCode} a las ${next.startTime}` };
      }
      return { status: "available" as const, label: "Disponible", sublabel: `Próxima clase: ${next.startTime}` };
    }

    return { status: "available" as const, label: "Disponible", sublabel: "Sin más clases hoy" };
  }

  const totalRooms = buildingData?.rooms.filter((r) => !r.isRestricted).length || 0;
  const availableRooms = buildingData?.rooms.filter((r) => getRoomStatus(r).status === "available").length || 0;

  const statusColors = {
    available: "border-l-green-500 bg-green-50",
    occupied: "border-l-red-400 bg-red-50/50",
    gap: "border-l-amber-400 bg-amber-50/50",
    restricted: "border-l-gray-300 bg-gray-50 opacity-60",
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-uniandes-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/buildings" className="text-white/70 hover:text-white transition-colors text-sm">
            ← Edificios
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {building.name}
            <span className="text-white/60 text-lg ml-2 font-mono">({building.code})</span>
          </h1>
          <div className="text-sm text-white/70 mt-1">
            {availableRooms} de {totalRooms} salones disponibles
          </div>
        </div>
      </header>

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex gap-1 flex-wrap">
              {DAY_ORDER.map((day) => (
                <button
                  key={day}
                  onClick={() => { setIsAutoTime(false); setSelectedDay(day); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedDay === day
                      ? "bg-uniandes-yellow text-uniandes-dark"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {DAY_NAMES[day]?.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => { setIsAutoTime(false); setSelectedTime(e.target.value); }}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm"
              />
              <button
                onClick={() => { setIsAutoTime(true); setSelectedDay(getCurrentDayCode()); setSelectedTime(getCurrentTime()); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isAutoTime ? "bg-green-100 text-green-800 border border-green-300" : "bg-secondary text-muted-foreground"
                }`}
              >
                {isAutoTime ? "🟢 Ahora" : "📍 Ir a ahora"}
              </button>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {sortedFloors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay datos de aulas disponibles para este edificio en el semestre actual.
          </div>
        ) : (
          <div className="space-y-8">
            {sortedFloors.map((floor) => {
              const rooms = roomsByFloor.get(floor)!;
              return (
                <div key={floor}>
                  <h2 className="text-lg font-bold mb-3 text-muted-foreground">Piso {floor}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {rooms.map((room) => {
                      const status = getRoomStatus(room);
                      return (
                        <Link key={room.room} href={`/classroom/${buildingCode}/${encodeURIComponent(room.room)}`}>
                          <Card className={`border-l-4 transition-all hover:shadow-md hover:scale-[1.01] ${statusColors[status.status]}`}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm">{buildingCode} {room.room}</span>
                                {status.status === "restricted" && <span className="text-xs">🔒</span>}
                                {status.status === "available" && <span className="text-xs text-green-600">✓ Libre</span>}
                                {status.status === "occupied" && <span className="text-xs text-red-600">Ocupado</span>}
                                {status.status === "gap" && <span className="text-xs text-amber-600">⏳</span>}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">{status.label}</div>
                              {status.sublabel && (
                                <div className="text-xs text-muted-foreground/70 truncate">{status.sublabel}</div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
