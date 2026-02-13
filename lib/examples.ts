/**
 * Example usage and validation of Phase 2 functionality
 * This file demonstrates the core features implemented in Phase 2
 */

import {
  parseCourseSections,
  groupByRoom,
  groupByCiclo,
  filterByCiclo,
  getCurrentCiclo,
  checkRoomAvailability,
  findAvailableSlots,
  getTimeBlocks,
  getVirtualSections,
  getPhysicalSections,
  extractEnums,
} from "./parse-courses";

import {
  getBuildingMetadata,
  getRoomRestrictions,
  getCicloData,
  getWhitelistedBuildings,
} from "./data-loader";

// Example raw course data from API
const rawCourseData = [
  {
    nrc: "12345",
    llave: "ISIS1001-1",
    term: "202610",
    ptrm: "1",
    ptrmdesc: "Semestre Completo",
    class: "1",
    course: "ISIS1001",
    title: "Fundamentos de Programación",
    credits: 3,
    professors: "John Doe",
    schedules: [
      {
        day: "L",
        startTime: "08:00",
        endTime: "09:30",
        building: "ML",
        room: "301",
      },
      {
        day: "I",
        startTime: "08:00",
        endTime: "09:30",
        building: "ML",
        room: "301",
      },
    ],
    campus: "Principal",
    maxenrol: 40,
    enrolled: 35,
    seatsavail: 5,
    modality: "Presencial",
    language: "Español",
    department: "Ingeniería de Sistemas",
  },
  {
    nrc: "12346",
    llave: "MATE1105-2",
    term: "202610",
    ptrm: "8A",
    ptrmdesc: "Primera Mitad",
    class: "2",
    course: "MATE1105",
    title: "Cálculo Diferencial",
    credits: 3,
    professors: "Jane Smith, Carlos García",
    schedules: [
      {
        day: "MJ",
        startTime: "10:00",
        endTime: "11:30",
        building: "AU",
        room: "103-4",
      },
    ],
    campus: "Principal",
    maxenrol: 80,
    enrolled: 78,
    seatsavail: 2,
    modality: "Presencial",
    language: "Español",
    department: "Matemáticas",
  },
  {
    nrc: "12348",
    llave: "LITE1611-1",
    term: "202610",
    ptrm: "1",
    ptrmdesc: "Semestre Completo",
    class: "1",
    course: "LITE1611",
    title: "Español",
    credits: 3,
    professors: "Pedro Ramírez",
    schedules: [
      {
        day: "MI",
        startTime: "12:00",
        endTime: "13:30",
        building: ".NOREQ",
        room: ".NOREQ",
      },
    ],
    campus: "Principal",
    maxenrol: 30,
    enrolled: 25,
    seatsavail: 5,
    modality: "Virtual",
    language: "Español",
    department: "Humanidades y Literatura",
  },
];

/**
 * Example 1: Parse course sections from API data
 */
export function example1_ParseCourseSections() {
  console.log("=== Example 1: Parse Course Sections ===\n");

  const sections = parseCourseSections(rawCourseData);

  console.log(`Parsed ${sections.length} course sections:`);
  sections.forEach((section) => {
    console.log(`- ${section.courseCode} (${section.courseName})`);
    console.log(`  NRC: ${section.nrc}, Ciclo: ${section.ptrm}`);
    console.log(`  Professor(s): ${section.professors?.join(", ")}`);
    console.log(`  Requires classroom: ${section.requiresClassroom}`);
    console.log(`  Schedules: ${section.schedules.length} time slots`);
    section.schedules.forEach((s) => {
      console.log(`    ${s.day} ${s.startTime}-${s.endTime} @ ${s.building} ${s.room}`);
    });
    console.log();
  });

  return sections;
}

/**
 * Example 2: Group courses by ciclo
 */
export function example2_GroupByCiclo(sections: any[]) {
  console.log("=== Example 2: Group by Ciclo ===\n");

  const cicloMap = groupByCiclo(sections);

  cicloMap.forEach((courses, ptrm) => {
    console.log(`Ciclo ${ptrm}: ${courses.length} courses`);
    courses.forEach((c) => console.log(`  - ${c.courseCode}: ${c.courseName}`));
    console.log();
  });

  // Filter by specific ciclo
  const firstHalfCourses = filterByCiclo(sections, "8A");
  console.log(`First half (8A) courses: ${firstHalfCourses.length}`);
  firstHalfCourses.forEach((c) => console.log(`  - ${c.courseCode}`));
  console.log();
}

/**
 * Example 3: Virtual vs Physical courses
 */
export function example3_VirtualVsPhysical(sections: any[]) {
  console.log("=== Example 3: Virtual vs Physical Courses ===\n");

  const virtualCourses = getVirtualSections(sections);
  const physicalCourses = getPhysicalSections(sections);

  console.log(`Virtual/Online courses: ${virtualCourses.length}`);
  virtualCourses.forEach((c) => console.log(`  - ${c.courseCode}: ${c.courseName}`));
  console.log();

  console.log(`Physical classroom courses: ${physicalCourses.length}`);
  physicalCourses.forEach((c) => console.log(`  - ${c.courseCode}: ${c.courseName}`));
  console.log();
}

/**
 * Example 4: Group by room with compound room handling
 */
export function example4_GroupByRoom(sections: any[]) {
  console.log("=== Example 4: Group by Room (with Compound Rooms) ===\n");

  const metadata = getBuildingMetadata();
  const restrictions = getRoomRestrictions();
  const buildings = groupByRoom(sections, metadata, restrictions);

  console.log(`Found ${buildings.length} buildings:`);
  buildings.forEach((building) => {
    console.log(`\n${building.building} - ${building.metadata?.name || "Unknown"}`);
    console.log(`  Campus: ${building.campus}`);
    console.log(`  Rooms: ${building.rooms.length}`);

    building.rooms.forEach((room) => {
      console.log(`\n  Room ${room.room}:`);
      if (room.floor) console.log(`    Floor: ${room.floor}`);
      if (room.isRestricted) console.log(`    ⚠️  Restricted: ${room.restrictionNote}`);
      console.log(`    Occupancies: ${room.occupancies.length}`);
      room.occupancies.forEach((occ) => {
        console.log(
          `      ${occ.day} ${occ.startTime}-${occ.endTime}: ${occ.courseCode} (${occ.ptrm})`
        );
      });
    });
  });
  console.log();

  return buildings;
}

/**
 * Example 5: Check room availability
 */
export function example5_CheckAvailability(buildings: any[]) {
  console.log("=== Example 5: Check Room Availability ===\n");

  // Find a specific room
  const mlBuilding = buildings.find((b) => b.building === "ML");
  if (!mlBuilding) {
    console.log("ML building not found");
    return;
  }

  const room301 = mlBuilding.rooms.find((r: any) => r.room === "301");
  if (!room301) {
    console.log("Room 301 not found");
    return;
  }

  // Check availability at different times
  const times = ["07:30", "08:00", "09:30", "10:00"];

  times.forEach((time) => {
    const status = checkRoomAvailability(room301, {
      building: "ML",
      room: "301",
      day: "L",
      time: time,
      respectGapRule: true,
    });

    console.log(`Time ${time}:`);
    if (status.isAvailable) {
      console.log("  ✓ Room is AVAILABLE");
      if (status.nextStateChange) {
        console.log(
          `  Next change: ${status.nextStateChange.willBeAvailable ? "Available" : "Occupied"} at ${status.nextStateChange.time}`
        );
      }
    } else {
      console.log("  ✗ Room is OCCUPIED");
      if (status.currentOccupancy) {
        console.log(`  Course: ${status.currentOccupancy.courseCode}`);
        console.log(`  Until: ${status.currentOccupancy.endTime}`);
      }
      if (status.nextStateChange) {
        console.log(`  Will be free at: ${status.nextStateChange.time}`);
      }
    }
    console.log();
  });
}

/**
 * Example 6: Get time blocks for calendar
 */
export function example6_TimeBlocks(buildings: any[]) {
  console.log("=== Example 6: Time Blocks for Calendar ===\n");

  const mlBuilding = buildings.find((b) => b.building === "ML");
  if (!mlBuilding) return;

  const room301 = mlBuilding.rooms.find((r: any) => r.room === "301");
  if (!room301) return;

  const blocks = getTimeBlocks(room301, "L", "07:00", "18:00", "1");

  console.log("Monday schedule for ML 301 (Full semester courses):");
  blocks.forEach((block) => {
    const status = block.isOccupied ? "OCCUPIED" : "FREE";
    const course = block.occupancy ? ` - ${block.occupancy.courseCode}` : "";
    console.log(`  ${block.startTime}-${block.endTime}: ${status}${course}`);
  });
  console.log();
}

/**
 * Example 7: Building metadata and restrictions
 */
export function example7_BuildingMetadata() {
  console.log("=== Example 7: Building Metadata ===\n");

  const whitelistedBuildings = getWhitelistedBuildings();

  console.log("Whitelisted buildings (in display order):");
  whitelistedBuildings.forEach((building) => {
    console.log(`\n${building.order}. ${building.code} - ${building.name}`);
    console.log(`   Campus: ${building.campus}`);
    console.log(`   Image: ${building.imageUrl}`);
    if (building.coordinates) {
      console.log(
        `   Location: ${building.coordinates.latitude}, ${building.coordinates.longitude}`
      );
    }
  });
  console.log();

  const restrictions = getRoomRestrictions();
  console.log(`\nRoom restrictions: ${restrictions.length}`);
  restrictions.forEach((r) => {
    console.log(`- ${r.building} ${r.room}: ${r.note}`);
  });
  console.log();
}

/**
 * Example 8: Current ciclo detection
 */
export function example8_CurrentCiclo() {
  console.log("=== Example 8: Current Ciclo Detection ===\n");

  const cicloData = getCicloData();
  const currentCiclo = getCurrentCiclo("202610", cicloData);

  console.log(`Current active ciclo for term 202610: ${currentCiclo}`);
  console.log(`Description: ${cicloData.ciclos.find((c: any) => c.id === currentCiclo)?.description}`);
  console.log();
}

/**
 * Example 9: Extract enums for dropdowns
 */
export function example9_ExtractEnums(sections: any[]) {
  console.log("=== Example 9: Extract Enums ===\n");

  const enums = extractEnums(sections);

  console.log("Available values for filters:");
  console.log(`Buildings: ${enums.buildings.join(", ")}`);
  console.log(`Departments: ${enums.departments.join(", ")}`);
  console.log(`Modalities: ${enums.modalities.join(", ")}`);
  console.log(`Campuses: ${enums.campuses.join(", ")}`);
  console.log(`Languages: ${enums.languages.join(", ")}`);
  console.log(`Days: ${enums.days.join(", ")}`);
  console.log(`PTRMs (Ciclos): ${enums.ptrms.join(", ")}`);
  console.log();
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log("\n" + "=".repeat(60));
  console.log("Phase 2 Functionality Examples");
  console.log("=".repeat(60) + "\n");

  const sections = example1_ParseCourseSections();
  example2_GroupByCiclo(sections);
  example3_VirtualVsPhysical(sections);
  const buildings = example4_GroupByRoom(sections);
  example5_CheckAvailability(buildings);
  example6_TimeBlocks(buildings);
  example7_BuildingMetadata();
  example8_CurrentCiclo();
  example9_ExtractEnums(sections);

  console.log("=".repeat(60));
  console.log("All examples completed!");
  console.log("=".repeat(60));
}

// Uncomment to run:
// runAllExamples();
