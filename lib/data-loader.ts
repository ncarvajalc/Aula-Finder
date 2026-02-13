/**
 * Data loader utilities for building metadata and room restrictions
 */

import { BuildingMetadata, RoomRestriction, BuildingAmenities, BuildingAmenity } from "@/types";

// Import data files
import buildingsMetadata from "@/data/buildings-metadata.json";
import roomRestrictionsData from "@/data/room-restrictions.json";
import ciclosData from "@/data/ciclos.json";
import buildingsAmenitiesData from "@/data/buildings-amenities.json";

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

/**
 * Get building amenities data
 */
export function getBuildingAmenities(): BuildingAmenities[] {
  return buildingsAmenitiesData.amenities as BuildingAmenities[];
}

/**
 * Get amenities for a specific building by code
 */
export function getAmenitiesByBuildingCode(code: string): BuildingAmenity[] {
  const buildingAmenities = getBuildingAmenities().find((b) => b.code === code);
  return buildingAmenities?.amenities || [];
}

/**
 * Get building metadata with amenities merged
 */
export function getBuildingMetadataWithAmenities(): BuildingMetadata[] {
  const buildings = getBuildingMetadata();
  const amenitiesData = getBuildingAmenities();
  
  return buildings.map((building) => {
    const amenities = amenitiesData.find((a) => a.code === building.code);
    return {
      ...building,
      amenities: amenities?.amenities || [],
    };
  });
}

/**
 * Get whitelisted buildings with amenities
 */
export function getWhitelistedBuildingsWithAmenities(): BuildingMetadata[] {
  return getBuildingMetadataWithAmenities()
    .filter((b) => b.order !== undefined)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
