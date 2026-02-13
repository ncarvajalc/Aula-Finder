import {
  CourseSection,
  RoomData,
  BuildingData,
  RoomOccupancy,
  Schedule,
} from "@/types";

/**
 * Parse course sections data from the raw JSON format
 */
export function parseCourseSections(rawData: any[]): CourseSection[] {
  return rawData.map((course) => ({
    nrc: course.nrc || "",
    courseCode: course.courseCode || course.curso || "",
    courseName: course.courseName || course.nombre || "",
    section: course.section || course.seccion || "",
    credits: parseInt(course.credits || course.creditos || "0"),
    professor: course.professor || course.profesor || "",
    schedules: parseSchedules(course.schedules || course.horarios || []),
    campus: course.campus || course.sede || "",
    capacity: parseInt(course.capacity || course.cupos || "0"),
    enrolled: parseInt(course.enrolled || course.inscritos || "0"),
    available: parseInt(course.available || course.disponibles || "0"),
    modality: course.modality || course.modalidad || "",
    language: course.language || course.idioma || "",
    department: course.department || course.departamento || "",
  }));
}

/**
 * Parse schedule data from raw format
 */
function parseSchedules(rawSchedules: any[]): Schedule[] {
  if (!Array.isArray(rawSchedules)) return [];

  return rawSchedules.map((schedule) => ({
    day: schedule.day || schedule.dia || "",
    startTime: schedule.startTime || schedule.horaInicio || "",
    endTime: schedule.endTime || schedule.horaFin || "",
    building: schedule.building || schedule.edificio || "",
    room: schedule.room || schedule.salon || "",
  }));
}

/**
 * Group course sections by room to create room occupancy data
 */
export function groupByRoom(sections: CourseSection[]): BuildingData[] {
  const buildingMap = new Map<string, Map<string, RoomOccupancy[]>>();

  // Process each course section and its schedules
  sections.forEach((section) => {
    section.schedules.forEach((schedule) => {
      const { building, room } = schedule;
      if (!building || !room) return;

      // Create occupancy record
      const occupancy: RoomOccupancy = {
        nrc: section.nrc,
        courseCode: section.courseCode,
        courseName: section.courseName,
        section: section.section,
        professor: section.professor,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        modality: section.modality,
      };

      // Initialize building if not exists
      if (!buildingMap.has(building)) {
        buildingMap.set(building, new Map());
      }

      // Initialize room if not exists
      const roomMap = buildingMap.get(building)!;
      if (!roomMap.has(room)) {
        roomMap.set(room, []);
      }

      // Add occupancy
      roomMap.get(room)!.push(occupancy);
    });
  });

  // Convert maps to array structure
  const buildings: BuildingData[] = [];
  buildingMap.forEach((roomMap, building) => {
    const rooms: RoomData[] = [];
    roomMap.forEach((occupancies, room) => {
      rooms.push({
        building,
        room,
        occupancies: occupancies.sort((a, b) => {
          // Sort by day then start time
          if (a.day !== b.day) return a.day.localeCompare(b.day);
          return a.startTime.localeCompare(b.startTime);
        }),
      });
    });

    buildings.push({
      building,
      campus: "", // Will be populated from course data
      rooms: rooms.sort((a, b) => a.room.localeCompare(b.room)),
    });
  });

  return buildings.sort((a, b) => a.building.localeCompare(b.building));
}

/**
 * Find available time slots for a specific room
 */
export function findAvailableSlots(
  room: RoomData,
  day: string,
  startTime: string,
  endTime: string
): boolean {
  const occupancies = room.occupancies.filter((occ) => occ.day === day);

  for (const occ of occupancies) {
    // Check if time slot overlaps with any occupancy
    if (
      (startTime >= occ.startTime && startTime < occ.endTime) ||
      (endTime > occ.startTime && endTime <= occ.endTime) ||
      (startTime <= occ.startTime && endTime >= occ.endTime)
    ) {
      return false; // Slot is occupied
    }
  }

  return true; // Slot is available
}

/**
 * Extract unique values from course data for enum generation
 */
export function extractEnums(sections: CourseSection[]) {
  const buildings = new Set<string>();
  const departments = new Set<string>();
  const modalities = new Set<string>();
  const campuses = new Set<string>();
  const languages = new Set<string>();
  const days = new Set<string>();

  sections.forEach((section) => {
    if (section.department) departments.add(section.department);
    if (section.modality) modalities.add(section.modality);
    if (section.campus) campuses.add(section.campus);
    if (section.language) languages.add(section.language);

    section.schedules.forEach((schedule) => {
      if (schedule.building) buildings.add(schedule.building);
      if (schedule.day) days.add(schedule.day);
    });
  });

  return {
    buildings: Array.from(buildings).sort(),
    departments: Array.from(departments).sort(),
    modalities: Array.from(modalities).sort(),
    campuses: Array.from(campuses).sort(),
    languages: Array.from(languages).sort(),
    days: Array.from(days).sort(),
    timestamp: new Date().toISOString(),
  };
}
