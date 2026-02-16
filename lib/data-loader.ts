/**
 * Data loader utilities for building metadata and room restrictions
 */

import { RoomRestriction, BuildingAmenities, BuildingAmenity } from "@/types";

// Import data files
import roomRestrictionsData from "@/data/room-restrictions.json";
import buildingsAmenitiesData from "@/data/buildings-amenities.json";

/**
 * Get room restrictions
 */
export function getRoomRestrictions(): RoomRestriction[] {
  return roomRestrictionsData.restrictions as RoomRestriction[];
}

/**
 * Get building amenities data
 */
function getBuildingAmenities(): BuildingAmenities[] {
  return buildingsAmenitiesData.amenities as BuildingAmenities[];
}

/**
 * Get amenity types (predefined icons and labels)
 */
function getAmenityTypes(): Record<string, { icon: string; label: string }> {
  return buildingsAmenitiesData.amenityTypes as Record<string, { icon: string; label: string }>;
}

/**
 * Get amenities for a specific building by code
 * Enriches amenities with icon and label from amenityTypes
 */
export function getAmenitiesByBuildingCode(code: string): BuildingAmenity[] {
  const buildingAmenities = getBuildingAmenities().find((b) => b.code === code);
  if (!buildingAmenities) return [];
  
  const amenityTypes = getAmenityTypes();
  
  // Enrich amenities with icon and name from amenityTypes
  return buildingAmenities.amenities.map((amenity) => {
    const typeInfo = amenityTypes[amenity.type];
    return {
      ...amenity,
      icon: typeInfo?.icon,
      name: typeInfo?.label,
    };
  });
}
