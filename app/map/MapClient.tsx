"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-latest.json";
import manifestData from "@/data/courses/manifest.json";
import buildingsAmenitiesData from "@/data/buildings-amenities.json";
import { parseCourseSections, groupByRoom } from "@/lib/parse-courses";
import { getRoomRestrictions } from "@/lib/data-loader";
import { BuildingMetadata } from "@/types";

// Dynamic import for Leaflet (SSR-incompatible)
const CampusMap = dynamic(() => import("./CampusMapLeaflet"), { ssr: false });

export default function MapClient() {
  return (
    <Suspense>
      <MapInner />
    </Suspense>
  );
}

function MapInner() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const backQuery = qs ? `?${qs}` : "";
  const settingsHref = `/${backQuery}`;

  const allBuildings = buildingsMetadata.buildings as BuildingMetadata[];
  const whitelisted = allBuildings.filter((b) => b.order !== undefined && b.coordinates);

  // Compute stats for buildings
  const sections = parseCourseSections(coursesData as any[]);
  const restrictions = getRoomRestrictions();
  const buildingsData = groupByRoom(sections, allBuildings, restrictions);

  const buildingStats = new Map<string, { total: number; available: number }>();
  for (const bd of buildingsData) {
    const unrestricted = bd.rooms.filter((r) => !r.isRestricted);
    buildingStats.set(bd.building, { total: unrestricted.length, available: unrestricted.length });
  }

  // Get amenities for each building
  const amenityTypes = buildingsAmenitiesData.amenityTypes as Record<string, { icon: string; label: string }>;
  const amenitiesMap = new Map<string, string[]>();
  for (const ba of buildingsAmenitiesData.amenities) {
    amenitiesMap.set(
      ba.code,
      ba.amenities.map((a: { type: string }) => amenityTypes[a.type]?.icon || "").filter(Boolean)
    );
  }

  // User location state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-uniandes-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href={`/${backQuery}`} className="text-white/70 hover:text-white transition-colors text-sm">
              ← Edificios
            </Link>
            <h1 className="text-xl font-bold mt-1">Mapa del Campus</h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8 text-white/90 bg-white/10 border border-white/30"
              title="Mapa del campus (pantalla actual)"
              aria-label="Mapa del campus (pantalla actual)"
              aria-current="page"
            >
              🗺️
            </span>
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
              title="Ir al inicio"
              aria-label="Ir al inicio"
            >
              ⚙️
            </Link>
            <button
              onClick={requestLocation}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-uniandes-yellow text-uniandes-dark hover:bg-uniandes-yellow/90 transition-colors"
            >
              📍 Mi ubicación
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 80px)" }}>
        <CampusMap
          buildings={whitelisted}
          buildingStats={buildingStats}
          amenitiesMap={amenitiesMap}
          userLocation={userLocation}
          linkQuery={backQuery}
        />
      </div>

      <div className="text-center text-xs text-muted-foreground py-2 bg-background border-t">
        Datos del semestre {manifestData.term} · {manifestData.totalSections} secciones
      </div>
    </main>
  );
}
