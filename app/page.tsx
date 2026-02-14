"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";

import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-202610.json";
import manifestData from "@/data/courses/manifest.json";
import ciclosData from "@/data/ciclos.json";
import { parseCourseSections, groupByRoom, getCurrentCiclo } from "@/lib/parse-courses";
import { getRoomRestrictions } from "@/lib/data-loader";
import { BuildingMetadata, PartOfTerm, DayOfWeek, RoomData } from "@/types";

const DAY_NAMES: Record<string, string> = {
  L: "Lunes",
  M: "Martes",
  I: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
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

function isRoomAvailableNow(
  room: RoomData,
  day: DayOfWeek,
  time: string,
  ptrm: PartOfTerm | "all"
): boolean {
  if (room.isRestricted) return false;
  const occupancies = room.occupancies.filter((occ) => {
    if (occ.day !== day) return false;
    if (ptrm !== "all" && occ.ptrm !== ptrm && occ.ptrm !== "1") return false;
    return true;
  });
  for (const occ of occupancies) {
    if (time >= occ.startTime && time < occ.endTime) return false;
    // 10-minute gap rule: transition time between classes
    const gapEnd = addMinutes(occ.endTime, CLASS_TRANSITION_MINUTES);
    if (time >= occ.endTime && time < gapEnd) return false;
  }
  return true;
}

// Classes end 10 minutes before the next slot to allow students to move between classrooms
const CLASS_TRANSITION_MINUTES = 10;

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function BuildingsPage() {
  const allBuildings = buildingsMetadata.buildings as BuildingMetadata[];
  const whitelisted = allBuildings.filter((b) => b.order !== undefined).sort((a, b) => (a.order || 0) - (b.order || 0));

  const [showHelp, setShowHelp] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [extraBuildings, setExtraBuildings] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayCode());
  const [selectedTime, setSelectedTime] = useState<string>(getCurrentTime());
  const [isAutoTime, setIsAutoTime] = useState(true);
  const [selectedCiclo, setSelectedCiclo] = useState<PartOfTerm | "all">(() => getCurrentCiclo(manifestData.term, ciclosData));

  // Auto-update time every 30 seconds
  useEffect(() => {
    if (!isAutoTime) return;
    const interval = setInterval(() => {
      setSelectedDay(getCurrentDayCode());
      setSelectedTime(getCurrentTime());
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoTime]);

  // Parse courses and compute availability
  const sections = parseCourseSections(coursesData as any[]);
  const restrictions = getRoomRestrictions();
  const buildingsData = groupByRoom(sections, allBuildings, restrictions);

  // Non-whitelisted buildings that have courses
  const nonWhitelisted = allBuildings.filter(
    (b) => b.order === undefined && buildingsData.some((bd) => bd.building === b.code)
  );

  // Combined list: whitelisted + user-selected extra
  const visibleBuildings = [
    ...whitelisted,
    ...nonWhitelisted.filter((b) => extraBuildings.has(b.code)),
  ];

  // Compute available rooms per building
  const buildingStats = new Map<string, { total: number; available: number }>();
  for (const bd of buildingsData) {
    const unrestricted = bd.rooms.filter((r) => !r.isRestricted);
    const available = unrestricted.filter((r) => isRoomAvailableNow(r, selectedDay, selectedTime, selectedCiclo));
    buildingStats.set(bd.building, { total: unrestricted.length, available: available.length });
  }

  const handleTimeChange = (time: string) => {
    setIsAutoTime(false);
    setSelectedTime(time);
  };

  const handleDayChange = (day: DayOfWeek) => {
    setIsAutoTime(false);
    setSelectedDay(day);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-uniandes-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-uniandes-yellow flex items-center justify-center font-bold text-uniandes-dark text-sm">
              AF
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Aula-Finder</h1>
              <p className="text-xs text-white/70">Universidad de los Andes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(true)}
              className="text-white hover:bg-white/10"
            >
              ⚙️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="text-white hover:bg-white/10"
            >
              ❓
            </Button>
          </div>
        </div>
      </header>

      {/* Time & Day Selector Bar */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Day selector */}
            <div className="flex gap-1">
              {DAY_ORDER.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayChange(day)}
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

            {/* Time selector */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm"
              />
              <button
                onClick={() => {
                  setIsAutoTime(true);
                  setSelectedDay(getCurrentDayCode());
                  setSelectedTime(getCurrentTime());
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isAutoTime
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {isAutoTime ? "🟢 Ahora" : "📍 Ir a ahora"}
              </button>
            </div>

            {/* Ciclo selector */}
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

      {/* Buildings Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {visibleBuildings.map((building) => {
            const stats = buildingStats.get(building.code);
            const hasAvailable = stats ? stats.available > 0 : false;
            const isInactive = stats ? stats.available === 0 && stats.total > 0 : false;

            return (
              <Link
                key={building.code}
                href={`/building/${building.code}`}
                className="group"
              >
                <Card className={`overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isInactive ? "opacity-50 grayscale" : ""
                }`}>
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    <Image
                      src={building.imageUrl || buildingsMetadata.defaultImage}
                      alt={building.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    {/* Available rooms badge */}
                    {stats && (
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                        hasAvailable
                          ? "bg-green-500 text-white"
                          : "bg-red-500/80 text-white"
                      }`}>
                        {stats.available}/{stats.total}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm truncate">{building.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{building.code}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Data info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Datos del semestre {manifestData.term} · Actualizado: {new Date(manifestData.timestamp).toLocaleDateString("es-CO")}
          {" · "}{manifestData.totalSections} secciones
        </div>
      </div>

      {/* Help Modal */}
      <Modal open={showHelp} onOpenChange={setShowHelp}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Acerca de Aula-Finder</ModalTitle>
          </ModalHeader>
          <div className="mt-4 space-y-4 text-sm">
            <p>
              <strong>Aula-Finder</strong> te ayuda a encontrar aulas disponibles en el campus de la
              Universidad de los Andes en tiempo real.
            </p>
            <div>
              <h3 className="font-semibold mb-1">¿Cómo funciona?</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Selecciona un edificio para ver sus salones organizados por piso</li>
                <li>El badge verde/rojo muestra cuántos salones están libres</li>
                <li>Haz clic en un salón para ver su calendario semanal</li>
                <li>Usa los filtros de día, hora y ciclo para ajustar la búsqueda</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">¿Encontraste un error?</h3>
              <p className="text-muted-foreground">
                Reporta problemas o propone nuevas ideas creando un{" "}
                <a
                  href="https://github.com/Open-Source-Uniandes/Aula-Finder/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-uniandes-yellow underline"
                >
                  issue en GitHub
                </a>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Contribuir</h3>
              <p className="text-muted-foreground">
                Este es un proyecto de{" "}
                <a
                  href="https://github.com/Open-Source-Uniandes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-uniandes-yellow underline"
                >
                  Open Source Uniandes
                </a>. ¡Todas las contribuciones son bienvenidas!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="mt-6 w-full px-4 py-2 bg-uniandes-dark text-white rounded-lg hover:bg-uniandes-dark/90 transition-colors"
          >
            Cerrar
          </button>
        </ModalContent>
      </Modal>

      {/* Config Modal */}
      <Modal open={showConfig} onOpenChange={setShowConfig}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Configuración</ModalTitle>
          </ModalHeader>
          <div className="mt-4 space-y-4">
            {/* Extra buildings toggle */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Edificios adicionales</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Los edificios principales ya se muestran. Activa edificios adicionales que quieras ver:
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {nonWhitelisted.map((building) => (
                  <label key={building.code} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extraBuildings.has(building.code)}
                      onChange={(e) => {
                        const next = new Set(extraBuildings);
                        if (e.target.checked) next.add(building.code);
                        else next.delete(building.code);
                        setExtraBuildings(next);
                      }}
                      className="rounded"
                    />
                    <span>{building.code} - {building.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Data info */}
            <div className="pt-3 border-t">
              <h3 className="text-sm font-semibold mb-1">Datos del semestre</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Semestre: {manifestData.term}</div>
                <div>Secciones: {manifestData.totalSections}</div>
                <div>Cursos únicos: {manifestData.totalCourses}</div>
                <div>Actualización: {new Date(manifestData.timestamp).toLocaleString("es-CO")}</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowConfig(false)}
            className="mt-6 w-full px-4 py-2 bg-uniandes-dark text-white rounded-lg hover:bg-uniandes-dark/90 transition-colors"
          >
            Cerrar
          </button>
        </ModalContent>
      </Modal>
    </main>
  );
}
