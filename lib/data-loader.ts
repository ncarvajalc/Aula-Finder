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
 * Get amenities for a specific building by code
 */
export function getAmenitiesByBuildingCode(code: string): BuildingAmenity[] {
  const buildingAmenities = getBuildingAmenities().find((b) => b.code === code);
  return buildingAmenities?.amenities || [];
}
