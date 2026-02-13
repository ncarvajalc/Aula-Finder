// Type definitions for AulaFinder
// Based on Universidad de los Andes course API structure

/**
 * Ciclo represents the part-of-term for a course section
 * Can be full semester ("1"), first 8 weeks ("8A"), or second 8 weeks ("8B")
 */
export interface Ciclo {
  id: string; // "1", "8A", or "8B"
  name: string; // "Semestre Completo", "Primera Mitad", "Segunda Mitad"
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface Schedule {
  day: string; // e.g., "L" (Lunes), "M" (Martes), "I" (Miércoles), "J" (Jueves), "V" (Viernes), "S" (Sábado), "D" (Domingo)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  building: string;
  room: string;
}

/**
 * CourseSection represents a course section from the Uniandes API
 * Maps to API fields: nrc, llave, term, ptrm, ptrmdesc, class, course, title,
 * enrolled, maxenrol, seatsavail, professors, schedules
 */
export interface CourseSection {
  // Core identifiers
  nrc: string; // API: nrc (unique section identifier)
  llave?: string; // API: llave (alternate course key)
  term: string; // API: term (e.g., "202610")
  
  // Part-of-term (ciclo) information
  ptrm: string; // API: ptrm - part-of-term code ("1", "8A", "8B")
  ptrmDesc?: string; // API: ptrmdesc - part-of-term description
  
  // Course information
  courseCode: string; // API: course (e.g., "ISIS1001")
  courseName: string; // API: title
  section: string; // API: class (section number)
  credits: number;
  
  // Instructor information
  professor: string; // API: professors (can be comma-separated list)
  professors?: string[]; // Parsed array of professors
  
  // Schedule and location
  schedules: Schedule[];
  campus: string;
  
  // Enrollment information
  capacity: number; // API: maxenrol
  enrolled: number; // API: enrolled
  available: number; // API: seatsavail
  
  // Additional metadata
  modality: string; // e.g., "Presencial", "Virtual", "Híbrido"
  language: string;
  department: string;
  
  // Flag for courses without physical classroom
  requiresClassroom: boolean; // false for .NOREQ rooms
}

export interface RoomOccupancy {
  nrc: string;
  courseCode: string;
  courseName: string;
  section: string;
  professor: string;
  day: string;
  startTime: string;
  endTime: string;
  modality: string;
  ptrm: string; // Part-of-term for filtering by ciclo
}

/**
 * RoomData represents a physical classroom with its occupancy schedule
 */
export interface RoomData {
  building: string;
  room: string;
  capacity?: number;
  floor?: number; // Extracted from first digit of room number
  isRestricted?: boolean; // true for labs and restricted rooms
  restrictionNote?: string; // Description of restriction
  occupancies: RoomOccupancy[];
}

/**
 * BuildingAmenity represents a facility or service available in a building
 */
export interface BuildingAmenity {
  type: "coffee_shop" | "elevator" | "accessible_restroom" | "study_area" | "printer" | "wifi" | "lab" | "vending_machine" | "parking";
  name: string;
  icon?: string;
  location?: string;
  description?: string;
  count?: number;
  floors?: number[];
}

/**
 * BuildingAmenities contains amenities for a specific building
 */
export interface BuildingAmenities {
  code: string;
  amenities: BuildingAmenity[];
}

/**
 * BuildingMetadata contains additional information about a building
 */
export interface BuildingMetadata {
  code: string; // Building code (e.g., "ML", "AU")
  name: string; // Full name (e.g., "Mario Laserna")
  campus: string;
  order?: number; // Display order for whitelisted buildings
  imageUrl?: string; // Path to building photo
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  amenities?: BuildingAmenity[]; // Optional amenities for this building
}

/**
 * BuildingData aggregates all rooms in a building
 */
export interface BuildingData {
  building: string;
  campus: string;
  metadata?: BuildingMetadata;
  rooms: RoomData[];
}

/**
 * RoomRestriction defines access rules for specific rooms
 */
export interface RoomRestriction {
  building: string;
  room: string; // Can use wildcards like "B3*" for all B3XX rooms
  isRestricted: boolean;
  restrictionType?: "lab" | "office" | "restricted" | "maintenance";
  note?: string;
  allowedDepartments?: string[];
}

export interface CoursesManifest {
  term: string; // e.g., "202610" for 2026-1
  timestamp: string; // ISO 8601 format
  filename: string;
  totalCourses: number;
  totalSections: number;
}

export interface EnumsData {
  buildings: string[];
  departments: string[];
  modalities: string[];
  campuses: string[];
  languages: string[];
  days: string[];
  timestamp: string;
}

// Utility types for filtering and querying
export type DayOfWeek = "L" | "M" | "I" | "J" | "V" | "S" | "D";
export type TimeSlot = { startTime: string; endTime: string };
export type BuildingCode = string;
export type RoomCode = string;

/**
 * PartOfTerm represents the ciclo types
 */
export type PartOfTerm = "1" | "8A" | "8B";

/**
 * RoomAvailabilityStatus represents the current state of a room
 */
export interface RoomAvailabilityStatus {
  isAvailable: boolean;
  currentOccupancy?: RoomOccupancy; // If occupied, which course
  nextStateChange?: {
    time: string; // HH:MM format
    willBeAvailable: boolean;
  };
}

/**
 * AvailabilityQuery parameters for checking room availability
 */
export interface AvailabilityQuery {
  building: string;
  room: string;
  day: DayOfWeek;
  time: string; // HH:MM format
  ptrm?: PartOfTerm; // Filter by ciclo
  respectGapRule?: boolean; // Apply 10-minute gap rule (default: true)
}

/**
 * TimeBlock represents a continuous block of time for calendar display
 */
export interface TimeBlock {
  startTime: string;
  endTime: string;
  isOccupied: boolean;
  occupancy?: RoomOccupancy;
}
