"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { BuildingMetadata } from "@/types";

// Campus center coordinates (Universidad de los Andes)
const CAMPUS_CENTER: [number, number] = [4.60200, -74.06465];
const DEFAULT_ZOOM = 17;

interface CampusMapProps {
  buildings: BuildingMetadata[];
  buildingStats: Map<string, { total: number; available: number }>;
  amenitiesMap: Map<string, string[]>;
  userLocation: [number, number] | null;
  linkQuery: string;
}

// Custom building marker icon
function createBuildingIcon(code: string, hasRooms: boolean) {
  return L.divIcon({
    className: "custom-building-marker",
    html: `<div class="building-marker-label ${hasRooms ? "available" : "unavailable"}">${code}</div>`,
    iconSize: [0, 0],
    iconAnchor: [20, 15],
    popupAnchor: [0, -15],
  });
}

// User location marker
function createUserIcon() {
  return L.divIcon({
    className: "user-location-marker",
    html: `<div style="
      width: 16px;
      height: 16px;
      background: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function UserLocationMarker({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), DEFAULT_ZOOM));
  }, [position]); // eslint-disable-line react-hooks/exhaustive-deps -- map instance is stable

  return <Marker position={position} icon={createUserIcon()} />;
}

export default function CampusMapLeaflet({
  buildings,
  buildingStats,
  amenitiesMap,
  userLocation,
  linkQuery,
}: CampusMapProps) {
  return (
    <MapContainer
      center={CAMPUS_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100%", width: "100%", minHeight: "calc(100vh - 120px)" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {buildings.map((building) => {
        if (!building.coordinates) return null;
        const pos: [number, number] = [
          building.coordinates.latitude,
          building.coordinates.longitude,
        ];
        const stats = buildingStats.get(building.code);
        const amenityIcons = amenitiesMap.get(building.code) || [];

        return (
          <Marker
            key={building.code}
            position={pos}
            icon={createBuildingIcon(building.code, !!stats)}
          >
            <Popup>
              <div className="campus-building-popup">
                <div className="campus-building-popup__title">{building.name}</div>
                <div className="campus-building-popup__meta">
                  {building.code} · {building.campus}
                </div>
                {stats && (
                  <div className="campus-building-popup__stats">
                    {stats.total} salones registrados
                  </div>
                )}
                {amenityIcons.length > 0 && (
                  <div className="campus-building-popup__amenities">
                    {amenityIcons.join(" ")}
                  </div>
                )}
                <Link
                  href={`/building/${building.code}${linkQuery}`}
                  className="campus-building-popup__link"
                >
                  Ver edificio →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {userLocation && <UserLocationMarker position={userLocation} />}
    </MapContainer>
  );
}
