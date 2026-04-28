"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";

import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-latest.json";
import manifestData from "@/data/courses/manifest.json";
import { parseCourseSections, groupByRoom } from "@/lib/parse-courses";
import { getRoomRestrictions } from "@/lib/data-loader";
import { BuildingMetadata, PartOfTerm, DayOfWeek, RoomData } from "@/types";
import { getAssetPath } from "@/lib/utils";
import { useTimeState } from "@/lib/time-state";
import { getClosureStatus } from "@/lib/closures";

const DAY_NAMES: Record<string, string> = {
  L: "Lunes",
  M: "Martes",
  I: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
};

const DAY_ORDER: DayOfWeek[] = ["L", "M", "I", "J", "V", "S"];

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
    const gapEnd = addMinutes(occ.endTime, CLASS_TRANSITION_MINUTES);
    if (time >= occ.endTime && time < gapEnd) return false;
  }
  return true;
}

const CLASS_TRANSITION_MINUTES = 10;

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function LegacyHomePage() {
  return (
    <Suspense>
      <LegacyHomePageInner />
    </Suspense>
  );
}

function LegacyHomePageInner() {
  const searchParams = useSearchParams();
  const shouldOpenConfigFromQuery = searchParams.get("config") === "1";
  const allBuildings = buildingsMetadata.buildings as BuildingMetadata[];
  const whitelisted = allBuildings.filter((b) => b.order !== undefined).sort((a, b) => (a.order || 0) - (b.order || 0));

  const [showHelp, setShowHelp] = useState(false);
  const [showConfig, setShowConfig] = useState(shouldOpenConfigFromQuery);
  const [extraBuildings, setExtraBuildings] = useState<Set<string>>(new Set());

  const {
    selectedDay,
    selectedTime,
    selectedCiclo,
    isAutoTime,
    showRestricted,
    handleDayChange,
    handleTimeChange,
    handleCicloChange,
    handleGoToNow,
    handleShowRestrictedChange,
    buildLinkQuery,
  } = useTimeState();

  const closureStatus = getClosureStatus(selectedDay, selectedTime);
  const sections = parseCourseSections(coursesData as any[]);
  const restrictions = getRoomRestrictions();
  const buildingsData = groupByRoom(sections, allBuildings, restrictions);

  const nonWhitelisted = allBuildings.filter(
    (b) => b.order === undefined && buildingsData.some((bd) => bd.building === b.code)
  );

  const visibleBuildings = [
    ...whitelisted,
    ...nonWhitelisted.filter((b) => extraBuildings.has(b.code)),
  ];

  const buildingStats = new Map<string, { total: number; available: number }>();
  for (const bd of buildingsData) {
    const unrestricted = bd.rooms.filter((r) => !r.isRestricted);
    const available = unrestricted.filter((r) => isRoomAvailableNow(r, selectedDay, selectedTime, selectedCiclo));
    const total = showRestricted ? bd.rooms.length : unrestricted.length;
    buildingStats.set(bd.building, { total, available: available.length });
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-uniandes-dark text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-uniandes-yellow text-sm font-bold text-uniandes-dark">
              AF
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Aula-Finder</h1>
              <p className="text-xs text-white/70">Universidad de los Andes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/map${buildLinkQuery()}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-white transition-colors hover:bg-white/10"
              title="Mapa del campus"
              aria-label="Ver mapa del campus"
            >
              🗺️
            </Link>
            <Link
              href="https://dashboard.openpanel.dev/share/overview/hQ9bOd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-white transition-colors hover:bg-white/10"
              title="Ver analíticas"
              aria-label="Ver analíticas de OpenPanel"
            >
              📊
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(true)}
              className="text-white hover:bg-white/10"
              aria-label="Abrir configuración"
            >
              ⚙️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="text-white hover:bg-white/10"
              aria-label="Abrir ayuda"
            >
              ❓
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-1" role="group" aria-label="Selector de día de la semana">
              {DAY_ORDER.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayChange(day)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedDay === day
                      ? "bg-uniandes-yellow text-uniandes-dark"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                  aria-label={`Seleccionar ${DAY_NAMES[day]}`}
                  aria-pressed={selectedDay === day}
                >
                  {DAY_NAMES[day]?.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                aria-label="Seleccionar hora"
              />
              <button
                onClick={() => {
                  handleGoToNow();
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isAutoTime
                    ? "border border-green-300 bg-green-100 text-green-800"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
                aria-label={isAutoTime ? "Hora actual activa" : "Ir a la hora actual"}
              >
                {isAutoTime ? "🟢 Ahora" : "📍 Ir a ahora"}
              </button>
            </div>

            <select
              value={selectedCiclo}
              onChange={(e) => handleCicloChange(e.target.value as PartOfTerm | "all")}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm"
              aria-label="Seleccionar ciclo académico"
            >
              <option value="all">Todos los ciclos</option>
              <option value="1">Semestre completo</option>
              <option value="8A">Ciclo 8A (1ª mitad)</option>
              <option value="8B">Ciclo 8B (2ª mitad)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {closureStatus.isClosed && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>🚫</span>
              <span>Universidad cerrada</span>
            </div>
            <p className="mt-1 text-xs text-amber-800">{closureStatus.reason}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visibleBuildings.map((building) => {
            const stats = buildingStats.get(building.code);
            const hasAvailable = stats ? stats.available > 0 : false;
            const isInactive = closureStatus.isClosed || (stats ? stats.available === 0 && stats.total > 0 : false);

            return (
              <Link
                key={building.code}
                href={`/building/${building.code}${buildLinkQuery()}`}
                className="group"
                aria-label={`Ver salones del edificio ${building.name}`}
              >
                <Card className={`overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg ${isInactive ? "grayscale opacity-50" : ""}`}>
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    <Image
                      src={getAssetPath(building.imageUrl || buildingsMetadata.defaultImage)}
                      alt={building.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    {stats && (
                      <div className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold ${hasAvailable ? "bg-green-500 text-white" : "bg-red-500/80 text-white"}`}>
                        {stats.available}/{stats.total}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="truncate text-sm font-semibold">{building.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{building.code}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 space-y-1 text-center text-xs text-muted-foreground">
          <div>
            Datos del semestre {manifestData.term} · Actualizado: {new Date(manifestData.timestamp).toLocaleDateString("es-CO")}
            {" · "}
            {manifestData.totalSections} secciones
          </div>
          <div className="mx-auto max-w-xl">
            La información se basa únicamente en la oferta de cursos actualizada a esa fecha.
            Si conoces de algún evento que ocupe salones o de un cambio de salón,{" "}
            <a
              href="https://github.com/Open-Source-Uniandes/Aula-Finder/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-uniandes-yellow underline"
            >
              crea un issue
            </a>
            .
          </div>
        </div>
      </div>

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
              <h3 className="mb-1 font-semibold">¿Cómo funciona?</h3>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>Selecciona un edificio para ver sus salones organizados por piso</li>
                <li>El badge verde/rojo muestra cuántos salones están libres</li>
                <li>Haz clic en un salón para ver su calendario semanal</li>
                <li>Usa los filtros de día, hora y ciclo para ajustar la búsqueda</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">¿Encontraste un error?</h3>
              <p className="text-muted-foreground">
                Reporta problemas o propone nuevas ideas creando un{" "}
                <a
                  href="https://github.com/Open-Source-Uniandes/Aula-Finder/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-uniandes-yellow underline"
                >
                  issue en GitHub
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Contribuir</h3>
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
            className="mt-6 w-full rounded-lg bg-uniandes-dark px-4 py-2 text-white transition-colors hover:bg-uniandes-dark/90"
            aria-label="Cerrar modal de ayuda"
          >
            Cerrar
          </button>
        </ModalContent>
      </Modal>

      <Modal open={showConfig} onOpenChange={setShowConfig}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Configuración</ModalTitle>
          </ModalHeader>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Visibilidad de salones</h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showRestricted}
                  onChange={(e) => handleShowRestrictedChange(e.target.checked)}
                  className="rounded"
                />
                <span>Mostrar salones con restricciones</span>
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Incluye laboratorios y salones de acceso restringido en la lista.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Edificios adicionales</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Los edificios principales ya se muestran. Activa edificios adicionales que quieras ver:
              </p>
              <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">
                {nonWhitelisted.map((building) => (
                  <label key={building.code} className="flex cursor-pointer items-center gap-2 text-sm">
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
          </div>
          <button
            onClick={() => setShowConfig(false)}
            className="mt-6 w-full rounded-lg bg-uniandes-dark px-4 py-2 text-white transition-colors hover:bg-uniandes-dark/90"
            aria-label="Cerrar modal de configuración"
          >
            Cerrar
          </button>
        </ModalContent>
      </Modal>
    </main>
  );
}
