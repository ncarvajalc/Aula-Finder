/**
 * Data loader utilities for building metadata and room restrictions
 */

import { BuildingMetadata, RoomRestriction } from "@/types";

// Import data files
import buildingsMetadata from "@/data/buildings-metadata.json";
import roomRestrictionsData from "@/data/room-restrictions.json";
import ciclosData from "@/data/ciclos.json";

/**
 * Get building metadata
 */
export function getBuildingMetadata(): BuildingMetadata[] {
  return buildingsMetadata.buildings as BuildingMetadata[];
}

/**
 * Get room restrictions
 */
export function getRoomRestrictions(): RoomRestriction[] {
  return roomRestrictionsData.restrictions as RoomRestriction[];
}

/**
 * Get ciclo definitions
 */
export function getCicloData(): any {
  return ciclosData;
}

/**
 * Get default building image URL
 */
export function getDefaultBuildingImage(): string {
  return buildingsMetadata.defaultImage || "/images/buildings/default.jpg";
}

/**
 * Get building metadata by code
 */
export function getBuildingByCode(code: string): BuildingMetadata | undefined {
  return getBuildingMetadata().find((b) => b.code === code);
}

/**
 * Get whitelisted buildings in display order
 */
export function getWhitelistedBuildings(): BuildingMetadata[] {
  return getBuildingMetadata()
    .filter((b) => b.order !== undefined)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
