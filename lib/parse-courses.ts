import {
  CourseSection,
  RoomData,
  BuildingData,
  RoomOccupancy,
  Schedule,
  RoomAvailabilityStatus,
  AvailabilityQuery,
  TimeBlock,
  PartOfTerm,
  BuildingMetadata,
  RoomRestriction,
} from "@/types";

/**
 * Parse course sections data from the raw API format
 * Handles API fields: nrc, llave, term, ptrm, ptrmdesc, class, course, title,
 * enrolled, maxenrol, seatsavail, professors, schedules
 */
export function parseCourseSections(rawData: any[]): CourseSection[] {
  return rawData.map((course) => {
    const schedules = parseSchedules(course.schedules || course.horarios || []);
    const requiresClassroom = !schedules.some(
      (s) => s.room === ".NOREQ" || s.room === "NOREQ" || !s.room
    );

    // Parse professors (can be comma-separated string or array)
    const professorField = course.professors || course.professor || course.profesor || "";
    const professors = Array.isArray(professorField)
      ? professorField
      : professorField.split(",").map((p: string) => p.trim()).filter(Boolean);

    return {
      // Core identifiers
      nrc: course.nrc || "",
      llave: course.llave || course.key,
      term: course.term || "",

      // Part-of-term (ciclo) information
      ptrm: course.ptrm || "1", // Default to full semester
      ptrmDesc: course.ptrmdesc || course.ptrmDesc,

      // Course information
      courseCode: course.course || course.courseCode || course.curso || "",
      courseName: course.title || course.courseName || course.nombre || "",
      section: course.class || course.section || course.seccion || "",
      credits: parseInt(course.credits || course.creditos || "0"),

      // Instructor information
      professor: professors[0] || "",
      professors: professors,

      // Schedule and location
      schedules: schedules,
      campus: course.campus || course.sede || "",

      // Enrollment information
      capacity: parseInt(course.maxenrol || course.capacity || course.cupos || "0"),
      enrolled: parseInt(course.enrolled || course.inscritos || "0"),
      available: parseInt(course.seatsavail || course.available || course.disponibles || "0"),

      // Additional metadata
      modality: course.modality || course.modalidad || "",
      language: course.language || course.idioma || "",
      department: course.department || course.departamento || "",

      // Classroom requirement flag
      requiresClassroom: requiresClassroom,
    };
  });
}

/**
 * Parse schedule data from raw format
 * Handles all day codes: l, m, i, j, v, s, d (case-insensitive)
 */
function parseSchedules(rawSchedules: any[]): Schedule[] {
  if (!Array.isArray(rawSchedules)) return [];

  const schedules: Schedule[] = [];
  
  rawSchedules.forEach((schedule) => {
    // Normalize day codes to uppercase
    const dayField = schedule.day || schedule.dia || "";
    const days = parseDays(dayField);

    const building = schedule.building || schedule.edificio || "";
    const room = schedule.room || schedule.salon || "";
    const startTime = schedule.startTime || schedule.horaInicio || "";
    const endTime = schedule.endTime || schedule.horaFin || "";

    // Create a schedule entry for each day
    days.forEach((day) => {
      schedules.push({
        day,
        startTime,
        endTime,
        building,
        room,
      });
    });
  });

  return schedules;
}

/**
 * Parse day codes from various formats
 * Handles: "L", "l", "LM", "lm", "L-M", "l-m", etc.
 */
function parseDays(dayField: string): string[] {
  const dayMap: { [key: string]: string } = {
    l: "L",
    m: "M",
    i: "I",
    j: "J",
    v: "V",
    s: "S",
    d: "D",
  };

  const days: string[] = [];
  const normalized = dayField.toUpperCase().replace(/[-\s]/g, "");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char in dayMap || ["L", "M", "I", "J", "V", "S", "D"].includes(char)) {
      days.push(dayMap[char.toLowerCase()] || char);
    }
  }

  return [...new Set(days)]; // Remove duplicates
}

/**
 * Group course sections by room to create room occupancy data
 * Handles compound rooms (e.g., "AU 103-4" creates entries for both 103 and 104)
 */
export function groupByRoom(
  sections: CourseSection[],
  buildingMetadata?: BuildingMetadata[],
  roomRestrictions?: RoomRestriction[]
): BuildingData[] {
  const buildingMap = new Map<string, Map<string, RoomOccupancy[]>>();
  const campusMap = new Map<string, string>(); // Track campus per building

  // Process each course section and its schedules
  sections.forEach((section) => {
    section.schedules.forEach((schedule) => {
      const { building, room } = schedule;
      if (!building || !room) return;

      // Skip .NOREQ rooms in occupancy grouping but keep in section data
      if (room === ".NOREQ" || room === "NOREQ") return;

      // Parse compound rooms (e.g., "103-4" means rooms 103 and 104)
      const rooms = parseCompoundRoom(room);

      rooms.forEach((parsedRoom) => {
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
          ptrm: section.ptrm,
        };

        // Initialize building if not exists
        if (!buildingMap.has(building)) {
          buildingMap.set(building, new Map());
          if (section.campus) {
            campusMap.set(building, section.campus);
          }
        }

        // Initialize room if not exists
        const roomMap = buildingMap.get(building)!;
        if (!roomMap.has(parsedRoom)) {
          roomMap.set(parsedRoom, []);
        }

        // Add occupancy
        roomMap.get(parsedRoom)!.push(occupancy);
      });
    });
  });

  // Convert maps to array structure
  const buildings: BuildingData[] = [];
  buildingMap.forEach((roomMap, building) => {
    const rooms: RoomData[] = [];
    roomMap.forEach((occupancies, room) => {
      // Extract floor from room number (first digit)
      const floor = extractFloor(room);
      
      // Check if room is restricted
      const restriction = findRoomRestriction(building, room, roomRestrictions);

      rooms.push({
        building,
        room,
        floor,
        isRestricted: restriction?.isRestricted,
        restrictionNote: restriction?.note,
        occupancies: occupancies.sort((a, b) => {
          // Sort by day then start time
          if (a.day !== b.day) return a.day.localeCompare(b.day);
          return a.startTime.localeCompare(b.startTime);
        }),
      });
    });

    // Sort rooms by floor then alphabetically
    const sortedRooms = rooms.sort((a, b) => {
      const floorDiff = (a.floor || 0) - (b.floor || 0);
      if (floorDiff !== 0) return floorDiff;
      return a.room.localeCompare(b.room);
    });

    // Find building metadata
    const metadata = buildingMetadata?.find((m) => m.code === building);

    buildings.push({
      building,
      campus: campusMap.get(building) || "",
      metadata,
      rooms: sortedRooms,
    });
  });

  // Sort buildings by metadata order if available, otherwise alphabetically
  return buildings.sort((a, b) => {
    const aOrder = a.metadata?.order ?? 999;
    const bOrder = b.metadata?.order ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.building.localeCompare(b.building);
  });
}

/**
 * Parse compound room notation (e.g., "103-4" or "103-104")
 * Returns array of individual room numbers
 */
function parseCompoundRoom(room: string): string[] {
  // Check for compound room pattern (e.g., "103-4" or "103-104")
  const compoundMatch = room.match(/^([A-Z]*)(\d+)-(\d+)$/i);
  
  if (!compoundMatch) {
    return [room]; // Not a compound room
  }

  const prefix = compoundMatch[1];
  const start = parseInt(compoundMatch[2]);
  const endStr = compoundMatch[3];

  // If end is single digit, combine with start prefix (103-4 = 103, 104)
  let end: number;
  if (endStr.length === 1) {
    const startPrefix = Math.floor(start / 10) * 10;
    end = startPrefix + parseInt(endStr);
  } else {
    end = parseInt(endStr);
  }

  // Generate room numbers
  const rooms: string[] = [];
  for (let i = start; i <= end; i++) {
    rooms.push(prefix + i);
  }

  return rooms;
}

/**
 * Extract floor number from room code (first digit)
 */
function extractFloor(room: string): number | undefined {
  const match = room.match(/\d/);
  if (!match) return undefined;
  return parseInt(match[0]);
}

/**
 * Find restriction for a specific room
 * Supports wildcards like "B3*" for all B3XX rooms
 */
function findRoomRestriction(
  building: string,
  room: string,
  restrictions?: RoomRestriction[]
): RoomRestriction | undefined {
  if (!restrictions) return undefined;

  return restrictions.find((r) => {
    if (r.building !== building) return false;
    
    // Check for wildcard match
    if (r.room.endsWith("*")) {
      const prefix = r.room.slice(0, -1);
      return room.startsWith(prefix);
    }
    
    return r.room === room;
  });
}

/**
 * Check if a room is available at a specific time
 * Respects the 10-minute gap rule: rooms not shown as available if gap between classes < 10 minutes
 */
export function checkRoomAvailability(
  room: RoomData,
  query: AvailabilityQuery
): RoomAvailabilityStatus {
  const respectGapRule = query.respectGapRule ?? true;
  const occupancies = room.occupancies.filter((occ) => {
    // Filter by day
    if (occ.day !== query.day) return false;
    
    // Filter by ptrm (ciclo) if specified
    if (query.ptrm && occ.ptrm !== query.ptrm) return false;
    
    return true;
  });

  // Find current occupancy
  const currentOccupancy = occupancies.find((occ) => {
    return query.time >= occ.startTime && query.time < occ.endTime;
  });

  if (currentOccupancy) {
    // Room is currently occupied
    return {
      isAvailable: false,
      currentOccupancy,
      nextStateChange: {
        time: currentOccupancy.endTime,
        willBeAvailable: true,
      },
    };
  }

  // Room is free, but check for upcoming occupancy and gap rule
  const upcomingOccupancies = occupancies
    .filter((occ) => occ.startTime > query.time)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const previousOccupancies = occupancies
    .filter((occ) => occ.endTime <= query.time)
    .sort((a, b) => b.endTime.localeCompare(a.endTime));

  // Check 10-minute gap rule
  if (respectGapRule) {
    // Check gap after previous class
    if (previousOccupancies.length > 0) {
      const lastClass = previousOccupancies[0];
      const minutesSinceLastClass = getMinutesDifference(lastClass.endTime, query.time);
      if (minutesSinceLastClass < 10) {
        // Not enough time since last class
        return {
          isAvailable: false,
          nextStateChange: upcomingOccupancies.length > 0
            ? {
                time: upcomingOccupancies[0].startTime,
                willBeAvailable: false,
              }
            : undefined,
        };
      }
    }

    // Check gap before next class
    if (upcomingOccupancies.length > 0) {
      const nextClass = upcomingOccupancies[0];
      const minutesUntilNextClass = getMinutesDifference(query.time, nextClass.startTime);
      if (minutesUntilNextClass < 10) {
        // Not enough time before next class
        return {
          isAvailable: false,
          nextStateChange: {
            time: nextClass.endTime,
            willBeAvailable: true,
          },
        };
      }
    }
  }

  // Room is available
  return {
    isAvailable: true,
    nextStateChange: upcomingOccupancies.length > 0
      ? {
          time: upcomingOccupancies[0].startTime,
          willBeAvailable: false,
        }
      : undefined,
  };
}

/**
 * Find available time slots for a specific room (legacy function, updated)
 */
export function findAvailableSlots(
  room: RoomData,
  day: string,
  startTime: string,
  endTime: string,
  ptrm?: PartOfTerm
): boolean {
  const occupancies = room.occupancies.filter((occ) => {
    if (occ.day !== day) return false;
    if (ptrm && occ.ptrm !== ptrm) return false;
    return true;
  });

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
 * Get time blocks for calendar display
 * Groups occupancies into continuous blocks with availability info
 */
export function getTimeBlocks(
  room: RoomData,
  day: string,
  startTime: string,
  endTime: string,
  ptrm?: PartOfTerm
): TimeBlock[] {
  const occupancies = room.occupancies
    .filter((occ) => {
      if (occ.day !== day) return false;
      if (ptrm && occ.ptrm !== ptrm) return false;
      // Only include occupancies that overlap with requested time range
      return !(occ.endTime <= startTime || occ.startTime >= endTime);
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const blocks: TimeBlock[] = [];
  let currentTime = startTime;

  occupancies.forEach((occ) => {
    // Add free block before occupancy if there's a gap
    if (currentTime < occ.startTime) {
      blocks.push({
        startTime: currentTime,
        endTime: occ.startTime,
        isOccupied: false,
      });
    }

    // Add occupied block
    blocks.push({
      startTime: occ.startTime,
      endTime: occ.endTime,
      isOccupied: true,
      occupancy: occ,
    });

    currentTime = occ.endTime;
  });

  // Add final free block if needed
  if (currentTime < endTime) {
    blocks.push({
      startTime: currentTime,
      endTime: endTime,
      isOccupied: false,
    });
  }

  return blocks;
}

/**
 * Get difference in minutes between two times (HH:MM format)
 */
function getMinutesDifference(time1: string, time2: string): number {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  return Math.abs((h2 * 60 + m2) - (h1 * 60 + m1));
}

/**
 * Group courses by ciclo (ptrm)
 */
export function groupByCiclo(sections: CourseSection[]): Map<PartOfTerm, CourseSection[]> {
  const cicloMap = new Map<PartOfTerm, CourseSection[]>();

  sections.forEach((section) => {
    const ptrm = (section.ptrm as PartOfTerm) || "1";
    if (!cicloMap.has(ptrm)) {
      cicloMap.set(ptrm, []);
    }
    cicloMap.get(ptrm)!.push(section);
  });

  return cicloMap;
}

/**
 * Filter courses by ciclo
 */
export function filterByCiclo(sections: CourseSection[], ptrm: PartOfTerm): CourseSection[] {
  return sections.filter((section) => section.ptrm === ptrm);
}

/**
 * Determine current ciclo based on today's date
 * Returns the active ciclo for the given term
 */
export function getCurrentCiclo(
  term: string,
  cicloData?: any
): PartOfTerm {
  if (!cicloData?.terms?.[term]) {
    return "1"; // Default to full semester
  }

  const today = new Date();
  const termData = cicloData.terms[term];

  // Check if we're in 8A period
  if (termData.ciclos["8A"]) {
    const endDate8A = new Date(termData.ciclos["8A"].endDate);
    if (today < endDate8A) {
      return "8A";
    }
  }

  // Check if we're in 8B period
  if (termData.ciclos["8B"]) {
    const startDate8B = new Date(termData.ciclos["8B"].startDate);
    if (today >= startDate8B) {
      return "8B";
    }
  }

  return "1"; // Full semester
}

/**
 * Get sections that don't require a physical classroom
 * These are courses with .NOREQ or no room assigned
 */
export function getVirtualSections(sections: CourseSection[]): CourseSection[] {
  return sections.filter((section) => !section.requiresClassroom);
}

/**
 * Get sections that require a physical classroom
 */
export function getPhysicalSections(sections: CourseSection[]): CourseSection[] {
  return sections.filter((section) => section.requiresClassroom);
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
  const ptrms = new Set<string>();

  sections.forEach((section) => {
    if (section.department) departments.add(section.department);
    if (section.modality) modalities.add(section.modality);
    if (section.campus) campuses.add(section.campus);
    if (section.language) languages.add(section.language);
    if (section.ptrm) ptrms.add(section.ptrm);

    section.schedules.forEach((schedule) => {
      if (schedule.building && schedule.room !== ".NOREQ" && schedule.room !== "NOREQ") {
        buildings.add(schedule.building);
      }
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
    ptrms: Array.from(ptrms).sort(),
    timestamp: new Date().toISOString(),
  };
}
