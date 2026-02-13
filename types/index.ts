// Type definitions for AulaFinder
// Based on Universidad de los Andes course API structure

export interface Ciclo {
  id: string;
  name: string;
  year: number;
  semester: number;
}

export interface Schedule {
  day: string; // e.g., "L" (Lunes), "M" (Martes), "I" (Miércoles), "J" (Jueves), "V" (Viernes), "S" (Sábado)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  building: string;
  room: string;
}

export interface CourseSection {
  nrc: string;
  courseCode: string;
  courseName: string;
  section: string;
  credits: number;
  professor: string;
  schedules: Schedule[];
  campus: string;
  capacity: number;
  enrolled: number;
  available: number;
  modality: string; // e.g., "Presencial", "Virtual", "Híbrido"
  language: string;
  department: string;
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
}

export interface RoomData {
  building: string;
  room: string;
  capacity?: number;
  occupancies: RoomOccupancy[];
}

export interface BuildingData {
  building: string;
  campus: string;
  rooms: RoomData[];
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
