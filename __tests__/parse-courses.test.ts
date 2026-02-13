import { describe, it, expect } from "vitest";
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
} from "@/lib/parse-courses";
import type { RoomData, CourseSection, BuildingMetadata, RoomRestriction } from "@/types";

// --- Test Data ---

const makeRawCourse = (overrides: Record<string, unknown> = {}) => ({
  nrc: "10001",
  llave: "ISIS1001-1",
  term: "202610",
  ptrm: "1",
  ptrmdesc: "Semestre Completo",
  class: "1",
  course: "ISIS1001",
  title: "DISEÑO Y ANALISIS DE ALGORITMOS",
  enrolled: "30",
  maxenrol: "40",
  seatsavail: "10",
  professors: "GARCIA LOPEZ MARIA",
  campus: "CAMPUS PRINCIPAL",
  modality: "Presencial",
  language: "Español",
  department: "Ingeniería de Sistemas",
  credits: "3",
  schedules: [
    {
      day: "LM",
      startTime: "09:30",
      endTime: "10:50",
      building: "ML",
      room: "510",
    },
  ],
  ...overrides,
});

const makeRoomData = (occupancies: RoomData["occupancies"] = []): RoomData => ({
  building: "ML",
  room: "510",
  floor: 5,
  isRestricted: false,
  occupancies,
});

const makeOccupancy = (overrides: Partial<RoomData["occupancies"][0]> = {}) => ({
  nrc: "10001",
  courseCode: "ISIS1001",
  courseName: "DISEÑO Y ANALISIS DE ALGORITMOS",
  section: "1",
  professor: "GARCIA LOPEZ MARIA",
  day: "L",
  startTime: "09:30",
  endTime: "10:50",
  modality: "Presencial",
  ptrm: "1",
  ...overrides,
});

// --- parseCourseSections ---

describe("parseCourseSections", () => {
  it("should parse a standard course from raw API data", () => {
    const raw = [makeRawCourse()];
    const sections = parseCourseSections(raw);

    expect(sections).toHaveLength(1);
    const section = sections[0];
    expect(section.nrc).toBe("10001");
    expect(section.courseCode).toBe("ISIS1001");
    expect(section.courseName).toBe("DISEÑO Y ANALISIS DE ALGORITMOS");
    expect(section.professor).toBe("GARCIA LOPEZ MARIA");
    expect(section.capacity).toBe(40);
    expect(section.enrolled).toBe(30);
    expect(section.available).toBe(10);
    expect(section.ptrm).toBe("1");
    expect(section.campus).toBe("CAMPUS PRINCIPAL");
    expect(section.requiresClassroom).toBe(true);
  });

  it("should expand multi-day schedules (LM → L, M)", () => {
    const raw = [makeRawCourse()];
    const sections = parseCourseSections(raw);
    expect(sections[0].schedules).toHaveLength(2);
    expect(sections[0].schedules[0].day).toBe("L");
    expect(sections[0].schedules[1].day).toBe("M");
  });

  it("should handle courses with no classroom (.NOREQ)", () => {
    const raw = [
      makeRawCourse({
        schedules: [
          { day: "L", startTime: "09:00", endTime: "10:00", building: "", room: ".NOREQ" },
        ],
      }),
    ];
    const sections = parseCourseSections(raw);
    expect(sections[0].requiresClassroom).toBe(false);
  });

  it("should handle comma-separated professors", () => {
    const raw = [
      makeRawCourse({
        professors: "PROF A, PROF B, PROF C",
      }),
    ];
    const sections = parseCourseSections(raw);
    expect(sections[0].professor).toBe("PROF A");
    expect(sections[0].professors).toEqual(["PROF A", "PROF B", "PROF C"]);
  });

  it("should handle array of professors", () => {
    const raw = [
      makeRawCourse({
        professors: ["PROF X", "PROF Y"],
      }),
    ];
    const sections = parseCourseSections(raw);
    expect(sections[0].professors).toEqual(["PROF X", "PROF Y"]);
  });

  it("should default ptrm to '1' if not specified", () => {
    const raw = [makeRawCourse({ ptrm: undefined })];
    const sections = parseCourseSections(raw);
    expect(sections[0].ptrm).toBe("1");
  });

  it("should handle courses with multiple schedule blocks", () => {
    const raw = [
      makeRawCourse({
        schedules: [
          { day: "L", startTime: "09:30", endTime: "10:50", building: "ML", room: "510" },
          { day: "I", startTime: "11:00", endTime: "12:20", building: "SD", room: "201" },
        ],
      }),
    ];
    const sections = parseCourseSections(raw);
    expect(sections[0].schedules).toHaveLength(2);
    expect(sections[0].schedules[0].building).toBe("ML");
    expect(sections[0].schedules[1].building).toBe("SD");
  });

  it("should handle empty schedules gracefully", () => {
    const raw = [makeRawCourse({ schedules: [] })];
    const sections = parseCourseSections(raw);
    expect(sections[0].schedules).toHaveLength(0);
    expect(sections[0].requiresClassroom).toBe(true);
  });
});

// --- groupByRoom ---

describe("groupByRoom", () => {
  it("should group courses by building and room", () => {
    const raw = [
      makeRawCourse({ nrc: "1", schedules: [{ day: "L", startTime: "09:00", endTime: "10:00", building: "ML", room: "510" }] }),
      makeRawCourse({ nrc: "2", schedules: [{ day: "M", startTime: "11:00", endTime: "12:00", building: "ML", room: "510" }] }),
      makeRawCourse({ nrc: "3", schedules: [{ day: "L", startTime: "09:00", endTime: "10:00", building: "SD", room: "201" }] }),
    ];
    const sections = parseCourseSections(raw);
    const buildings = groupByRoom(sections);

    const ml = buildings.find((b) => b.building === "ML");
    const sd = buildings.find((b) => b.building === "SD");
    expect(ml).toBeDefined();
    expect(sd).toBeDefined();
    expect(ml!.rooms).toHaveLength(1);
    expect(ml!.rooms[0].occupancies).toHaveLength(2);
    expect(sd!.rooms).toHaveLength(1);
  });

  it("should skip .NOREQ rooms in grouping", () => {
    const raw = [
      makeRawCourse({
        schedules: [
          { day: "L", startTime: "09:00", endTime: "10:00", building: "", room: ".NOREQ" },
        ],
      }),
    ];
    const sections = parseCourseSections(raw);
    const buildings = groupByRoom(sections);
    expect(buildings).toHaveLength(0);
  });

  it("should handle compound rooms (e.g., 103-4 → 103, 104)", () => {
    const raw = [
      makeRawCourse({
        schedules: [
          { day: "L", startTime: "09:00", endTime: "10:00", building: "AU", room: "103-4" },
        ],
      }),
    ];
    const sections = parseCourseSections(raw);
    const buildings = groupByRoom(sections);

    const au = buildings.find((b) => b.building === "AU");
    expect(au).toBeDefined();
    expect(au!.rooms).toHaveLength(2);
    const roomNames = au!.rooms.map((r) => r.room).sort();
    expect(roomNames).toEqual(["103", "104"]);
  });

  it("should extract floor from room number", () => {
    const raw = [
      makeRawCourse({
        schedules: [
          { day: "L", startTime: "09:00", endTime: "10:00", building: "ML", room: "301" },
        ],
      }),
    ];
    const sections = parseCourseSections(raw);
    const buildings = groupByRoom(sections);

    expect(buildings[0].rooms[0].floor).toBe(3);
  });

  it("should apply room restrictions with exact match", () => {
    const raw = [
      makeRawCourse({
        schedules: [
          { day: "L", startTime: "09:00", endTime: "10:00", building: "B", room: "301" },
        ],
      }),
    ];
    const restrictions: RoomRestriction[] = [
      { building: "B", room: "301", isRestricted: true, restrictionType: "lab", note: "Laboratorio" },
    ];
    const sections = parseCourseSections(raw);
    const buildings = groupByRoom(sections, undefined, restrictions);

    expect(buildings[0].rooms[0].isRestricted).toBe(true);
    expect(buildings[0].rooms[0].restrictionNote).toBe("Laboratorio");
  });

  it("should apply room restrictions with wildcard match", () => {
    const raw = [
      makeRawCourse({
        schedules: [
          { day: "L", startTime: "09:00", endTime: "10:00", building: "B", room: "B301" },
        ],
      }),
    ];
    const restrictions: RoomRestriction[] = [
      { building: "B", room: "B3*", isRestricted: true, restrictionType: "lab", note: "Laboratorio" },
    ];
    const sections = parseCourseSections(raw);
    const buildings = groupByRoom(sections, undefined, restrictions);

    expect(buildings[0].rooms[0].isRestricted).toBe(true);
  });

  it("should sort rooms by floor then name", () => {
    const raw = [
      makeRawCourse({ nrc: "1", schedules: [{ day: "L", startTime: "09:00", endTime: "10:00", building: "ML", room: "301" }] }),
      makeRawCourse({ nrc: "2", schedules: [{ day: "L", startTime: "09:00", endTime: "10:00", building: "ML", room: "101" }] }),
      makeRawCourse({ nrc: "3", schedules: [{ day: "L", startTime: "09:00", endTime: "10:00", building: "ML", room: "201" }] }),
    ];
    const sections = parseCourseSections(raw);
    const buildings = groupByRoom(sections);

    const ml = buildings.find((b) => b.building === "ML")!;
    expect(ml.rooms[0].room).toBe("101");
    expect(ml.rooms[1].room).toBe("201");
    expect(ml.rooms[2].room).toBe("301");
  });
});

// --- checkRoomAvailability ---

describe("checkRoomAvailability", () => {
  it("should report room as available when no occupancies", () => {
    const room = makeRoomData();
    const result = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "10:00",
    });
    expect(result.isAvailable).toBe(true);
  });

  it("should report room as occupied during a class", () => {
    const room = makeRoomData([makeOccupancy()]);
    const result = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "10:00",
    });
    expect(result.isAvailable).toBe(false);
    expect(result.currentOccupancy).toBeDefined();
    expect(result.currentOccupancy!.courseCode).toBe("ISIS1001");
  });

  it("should report room as available before a class", () => {
    const room = makeRoomData([makeOccupancy()]);
    const result = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "08:00",
    });
    expect(result.isAvailable).toBe(true);
    expect(result.nextStateChange).toBeDefined();
    expect(result.nextStateChange!.time).toBe("09:30");
  });

  it("should apply 10-minute gap rule after a class", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "09:00", endTime: "10:00" })]);

    // 5 minutes after class: should be unavailable (gap rule)
    const result1 = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "10:05",
      respectGapRule: true,
    });
    expect(result1.isAvailable).toBe(false);

    // 15 minutes after class: should be available
    const result2 = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "10:15",
      respectGapRule: true,
    });
    expect(result2.isAvailable).toBe(true);
  });

  it("should apply 10-minute gap rule before a class", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "10:00", endTime: "11:00" })]);

    // 5 minutes before class: should be unavailable (gap rule)
    const result = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "09:55",
      respectGapRule: true,
    });
    expect(result.isAvailable).toBe(false);
  });

  it("should ignore gap rule when respectGapRule is false", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "09:00", endTime: "10:00" })]);

    const result = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "10:05",
      respectGapRule: false,
    });
    expect(result.isAvailable).toBe(true);
  });

  it("should filter by day", () => {
    const room = makeRoomData([makeOccupancy({ day: "L" })]);

    const result = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "M",
      time: "10:00",
    });
    expect(result.isAvailable).toBe(true);
  });

  it("should filter by ptrm when specified", () => {
    const room = makeRoomData([makeOccupancy({ ptrm: "8A" })]);

    // Query for 8B → should be available
    const result = checkRoomAvailability(room, {
      building: "ML",
      room: "510",
      day: "L",
      time: "10:00",
      ptrm: "8B",
    });
    expect(result.isAvailable).toBe(true);
  });
});

// --- findAvailableSlots ---

describe("findAvailableSlots", () => {
  it("should return true for available time slot", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "09:00", endTime: "10:00" })]);
    expect(findAvailableSlots(room, "L", "11:00", "12:00")).toBe(true);
  });

  it("should return false for overlapping time slot", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "09:00", endTime: "10:00" })]);
    expect(findAvailableSlots(room, "L", "09:30", "10:30")).toBe(false);
  });

  it("should return false when query envelops an occupancy", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "09:00", endTime: "10:00" })]);
    expect(findAvailableSlots(room, "L", "08:00", "11:00")).toBe(false);
  });

  it("should return true for adjacent time slots (no overlap)", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "09:00", endTime: "10:00" })]);
    expect(findAvailableSlots(room, "L", "10:00", "11:00")).toBe(true);
  });
});

// --- getTimeBlocks ---

describe("getTimeBlocks", () => {
  it("should return a single free block when no occupancies", () => {
    const room = makeRoomData();
    const blocks = getTimeBlocks(room, "L", "08:00", "18:00");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].isOccupied).toBe(false);
    expect(blocks[0].startTime).toBe("08:00");
    expect(blocks[0].endTime).toBe("18:00");
  });

  it("should create free and occupied blocks", () => {
    const room = makeRoomData([makeOccupancy({ startTime: "10:00", endTime: "11:00" })]);
    const blocks = getTimeBlocks(room, "L", "08:00", "14:00");

    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toEqual({ startTime: "08:00", endTime: "10:00", isOccupied: false });
    expect(blocks[1].isOccupied).toBe(true);
    expect(blocks[1].startTime).toBe("10:00");
    expect(blocks[1].endTime).toBe("11:00");
    expect(blocks[2]).toEqual({ startTime: "11:00", endTime: "14:00", isOccupied: false });
  });

  it("should handle consecutive occupancies", () => {
    const room = makeRoomData([
      makeOccupancy({ startTime: "09:00", endTime: "10:00" }),
      makeOccupancy({ startTime: "10:00", endTime: "11:00", courseCode: "MATE1001" }),
    ]);
    const blocks = getTimeBlocks(room, "L", "08:00", "12:00");

    expect(blocks).toHaveLength(4);
    expect(blocks[0].isOccupied).toBe(false);
    expect(blocks[1].isOccupied).toBe(true);
    expect(blocks[2].isOccupied).toBe(true);
    expect(blocks[3].isOccupied).toBe(false);
  });
});

// --- groupByCiclo & filterByCiclo ---

describe("groupByCiclo and filterByCiclo", () => {
  it("should group sections by ptrm", () => {
    const raw = [
      makeRawCourse({ nrc: "1", ptrm: "1" }),
      makeRawCourse({ nrc: "2", ptrm: "8A" }),
      makeRawCourse({ nrc: "3", ptrm: "8B" }),
      makeRawCourse({ nrc: "4", ptrm: "1" }),
    ];
    const sections = parseCourseSections(raw);
    const cicloMap = groupByCiclo(sections);

    expect(cicloMap.get("1")?.length).toBe(2);
    expect(cicloMap.get("8A")?.length).toBe(1);
    expect(cicloMap.get("8B")?.length).toBe(1);
  });

  it("should filter sections by ptrm", () => {
    const raw = [
      makeRawCourse({ nrc: "1", ptrm: "1" }),
      makeRawCourse({ nrc: "2", ptrm: "8A" }),
      makeRawCourse({ nrc: "3", ptrm: "8B" }),
    ];
    const sections = parseCourseSections(raw);

    expect(filterByCiclo(sections, "8A")).toHaveLength(1);
    expect(filterByCiclo(sections, "8A")[0].nrc).toBe("2");
  });
});

// --- getCurrentCiclo ---

describe("getCurrentCiclo", () => {
  it("should return '1' when no ciclo data is available", () => {
    expect(getCurrentCiclo("202610")).toBe("1");
    expect(getCurrentCiclo("202610", null)).toBe("1");
    expect(getCurrentCiclo("202610", {})).toBe("1");
  });

  it("should return '1' when term is not in ciclo data", () => {
    const cicloData = { terms: { "202620": {} } };
    expect(getCurrentCiclo("202610", cicloData)).toBe("1");
  });
});

// --- getVirtualSections & getPhysicalSections ---

describe("getVirtualSections and getPhysicalSections", () => {
  it("should separate virtual and physical courses", () => {
    const raw = [
      makeRawCourse({
        nrc: "1",
        schedules: [{ day: "L", startTime: "09:00", endTime: "10:00", building: "ML", room: "510" }],
      }),
      makeRawCourse({
        nrc: "2",
        schedules: [{ day: "L", startTime: "09:00", endTime: "10:00", building: "", room: ".NOREQ" }],
      }),
    ];
    const sections = parseCourseSections(raw);

    expect(getPhysicalSections(sections)).toHaveLength(1);
    expect(getVirtualSections(sections)).toHaveLength(1);
    expect(getPhysicalSections(sections)[0].nrc).toBe("1");
    expect(getVirtualSections(sections)[0].nrc).toBe("2");
  });
});

// --- extractEnums ---

describe("extractEnums", () => {
  it("should extract unique enum values from sections", () => {
    const raw = [
      makeRawCourse({ department: "Dept A", modality: "Presencial", language: "Español" }),
      makeRawCourse({ department: "Dept B", modality: "Virtual", language: "English" }),
      makeRawCourse({ department: "Dept A", modality: "Presencial", language: "Español" }),
    ];
    const sections = parseCourseSections(raw);
    const enums = extractEnums(sections);

    expect(enums.departments).toEqual(["Dept A", "Dept B"]);
    expect(enums.modalities).toEqual(["Presencial", "Virtual"]);
    expect(enums.languages).toEqual(["English", "Español"]);
    expect(enums.buildings).toContain("ML");
  });
});

// --- Integration test with real data format ---

describe("Integration: real course data format", () => {
  it("should handle a course matching the actual API format", () => {
    const raw = [
      {
        nrc: "57393",
        term: "202610",
        ptrm: "1",
        ptrmdesc: "Semestre de 16 Semanas",
        class: "1",
        course: "LENG2231",
        title: "FRANÇAIS PRE-INTERMÉDIAIRE",
        enrolled: "20",
        maxenrol: "25",
        seatsavail: "5",
        professors: "RAMIREZ JIMENEZ DENIS JANETH",
        campus: "CAMPUS PRINCIPAL",
        modality: "Presencial",
        language: "Español",
        department: "Lenguas y Cultura",
        credits: "3",
        schedules: [
          {
            day: "MJ",
            startTime: "14:00",
            endTime: "15:20",
            building: "ML",
            room: "110",
          },
        ],
      },
    ];

    const sections = parseCourseSections(raw);
    expect(sections).toHaveLength(1);
    expect(sections[0].schedules).toHaveLength(2); // MJ expanded to M and J
    expect(sections[0].schedules[0].day).toBe("M");
    expect(sections[0].schedules[1].day).toBe("J");

    const buildings = groupByRoom(sections);
    expect(buildings).toHaveLength(1);
    expect(buildings[0].building).toBe("ML");
    expect(buildings[0].rooms[0].room).toBe("110");
    expect(buildings[0].rooms[0].occupancies).toHaveLength(2);
  });
});
