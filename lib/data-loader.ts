/**
 * Data loader utilities for building metadata and room restrictions
 */

import { RoomRestriction } from "@/types";

// Import data files
import roomRestrictionsData from "@/data/room-restrictions.json";

/**
 * Get room restrictions
 */
export function getRoomRestrictions(): RoomRestriction[] {
  return roomRestrictionsData.restrictions as RoomRestriction[];
}
