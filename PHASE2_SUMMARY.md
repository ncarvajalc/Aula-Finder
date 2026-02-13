# Phase 2 Implementation Summary

## Overview
Phase 2 successfully implements core data models, enhanced parsing logic, ciclo handling, building/room structure, and availability computation for AulaFinder. No UI changes were made - all changes are in the data layer, preparing the repository for Phase 3 (UI implementation).

## What Was Implemented

### 1. Enhanced Type Definitions (`types/index.ts`)
- **CourseSection**: Extended to support all Uniandes API fields
  - Added: `llave`, `term`, `ptrm`, `ptrmDesc`
  - Changed enrollment fields to match API: `maxenrol` → `capacity`, `seatsavail` → `available`
  - Added: `professors` array (in addition to single `professor`)
  - Added: `requiresClassroom` boolean flag
- **Ciclo**: Enhanced with `startDate` and `endDate` optional fields
- **RoomData**: Added `floor`, `isRestricted`, `restrictionNote`
- **BuildingMetadata**: New type for building information (name, coordinates, images, order)
- **RoomRestriction**: New type for room access rules
- **Availability Types**: `RoomAvailabilityStatus`, `AvailabilityQuery`, `TimeBlock`
- **PartOfTerm**: Type alias for "1" | "8A" | "8B"

### 2. Advanced Course Parser (`lib/parse-courses.ts`)

#### Core Parsing Functions
- **parseCourseSections**: Maps API fields to internal types
  - Handles multiple professor formats (string or array, comma-separated)
  - Detects virtual courses (`.NOREQ` rooms)
  - Parses all API fields: nrc, llave, term, ptrm, ptrmdesc, class, course, title, professors, schedules, maxenrol, enrolled, seatsavail

- **parseSchedules**: Enhanced schedule parsing
  - Handles multi-day formats: "LM", "MJ", "LMI", etc.
  - Normalizes day codes (l→L, m→M, i→I, j→J, v→V, s→S, d→D)
  - Expands multi-day schedules into individual entries

- **parseDays**: Parses various day code formats with normalization

#### Room Grouping
- **groupByRoom**: Creates building/room hierarchy
  - Parses compound rooms (e.g., "103-4" → rooms 103, 104)
  - Applies building metadata (coordinates, images, display order)
  - Applies room restrictions (labs, offices)
  - Extracts floor numbers from room codes
  - Sorts rooms by floor, then alphabetically
  - Sorts buildings by display order (whitelisted first)

- **parseCompoundRoom**: Handles complex room notations
  - "103-4" → [103, 104]
  - "109-11" → [109, 110, 111]
  - "AU103-4" → [AU103, AU104]
  - "201-205" → [201, 202, 203, 204, 205]

#### Availability Logic
- **checkRoomAvailability**: Real-time room status
  - Checks if room is free at specific day/time
  - Applies 10-minute gap rule (configurable)
  - Filters by ciclo (ptrm)
  - Returns current occupancy or next state change

- **findAvailableSlots**: Legacy function (updated)
  - Checks if a time range is available
  - Supports ciclo filtering

- **getTimeBlocks**: Generate calendar blocks
  - Creates time blocks for a full day
  - Groups occupancies into continuous blocks
  - Useful for calendar/schedule visualization

#### Ciclo Functions
- **groupByCiclo**: Group courses by part-of-term
- **filterByCiclo**: Filter courses for specific ciclo
- **getCurrentCiclo**: Date-based ciclo detection
  - Determines active ciclo (8A, 8B, or full semester)
  - Based on today's date and term data

#### Virtual vs Physical
- **getVirtualSections**: Courses without physical classrooms
- **getPhysicalSections**: Courses requiring classrooms

#### Enum Extraction
- **extractEnums**: Extract unique values for filters
  - Buildings, departments, modalities, campuses, languages, days, ptrms

### 3. Data Files

#### Building Metadata (`data/buildings-metadata.json`)
```json
{
  "buildings": [
    {
      "code": "ML",
      "name": "Mario Laserna",
      "campus": "Principal",
      "order": 1,
      "imageUrl": "/images/buildings/ml.jpg",
      "coordinates": { "latitude": 4.601861, "longitude": -74.064722 }
    },
    // ... 5 more buildings
  ],
  "defaultImage": "/images/buildings/default.jpg"
}
```

#### Room Restrictions (`data/room-restrictions.json`)
```json
{
  "restrictions": [
    {
      "building": "B",
      "room": "B3*",  // Wildcard support
      "isRestricted": true,
      "restrictionType": "lab",
      "note": "Laboratorios de ingeniería - Acceso restringido"
    }
  ]
}
```

#### Ciclo Definitions (`data/ciclos.json`)
```json
{
  "ciclos": [
    { "id": "1", "name": "Semestre Completo", ... },
    { "id": "8A", "name": "Primera Mitad", ... },
    { "id": "8B", "name": "Segunda Mitad", ... }
  ],
  "terms": {
    "202610": {
      "ciclos": {
        "1": { "startDate": "2026-01-15", "endDate": "2026-05-15" },
        "8A": { "startDate": "2026-01-15", "endDate": "2026-03-15" },
        "8B": { "startDate": "2026-03-15", "endDate": "2026-05-15" }
      }
    }
  }
}
```

#### Sample Course Data (`data/courses/courses-202610.json`)
- 5 sample course sections
- Examples of all ciclo types (1, 8A, 8B)
- Compound room example (AU 103-4)
- Virtual course example (.NOREQ)
- Multiple professors example

### 4. Data Loader (`lib/data-loader.ts`)
Utility functions for loading metadata:
- `getBuildingMetadata()`: Get all building metadata
- `getRoomRestrictions()`: Get room restrictions
- `getCicloData()`: Get ciclo definitions
- `getBuildingByCode(code)`: Find specific building
- `getWhitelistedBuildings()`: Get ordered building list

### 5. Examples (`lib/examples.ts`)
Comprehensive examples demonstrating all Phase 2 features:
- Example 1: Parse course sections from API data
- Example 2: Group courses by ciclo
- Example 3: Virtual vs physical courses
- Example 4: Group by room with compound rooms
- Example 5: Check room availability
- Example 6: Get time blocks for calendar
- Example 7: Building metadata and restrictions
- Example 8: Current ciclo detection
- Example 9: Extract enums for dropdowns

### 6. Documentation (`README.md`)
Updated with comprehensive Phase 2 documentation:
- Data model explanations
- Ciclo system description
- Building/room structure
- Availability logic with 10-minute gap rule
- Schedule day codes reference
- Code examples for all features
- Updated roadmap showing Phase 2 complete

## Key Features

### 10-Minute Gap Rule
Rooms are not shown as available if the gap between classes is less than 10 minutes:
```typescript
checkRoomAvailability(room, {
  building: "ML",
  room: "301",
  day: "L",
  time: "09:35",
  respectGapRule: true  // Default
});
```

### Compound Room Handling
Rooms like "AU 103-4" are automatically parsed into separate entries:
- Course scheduled in "AU 103-4" appears in both room 103 and 104
- Full occupancy metadata preserved for both rooms
- Handles edge cases: "109-11" → [109, 110, 111]

### Ciclo System
Three types of courses supported:
- **"1"**: Full semester (16 weeks)
- **"8A"**: First 8 weeks
- **"8B"**: Second 8 weeks

Automatic detection based on current date:
```typescript
const currentCiclo = getCurrentCiclo("202610", cicloData);
// Returns "8A", "8B", or "1" based on today's date
```

### Virtual Course Handling
Courses with `.NOREQ` rooms:
- Flagged with `requiresClassroom: false`
- Not included in room occupancy grouping
- Can be filtered separately for display

## Testing

### Manual Tests Performed
1. ✅ TypeScript compilation (no errors)
2. ✅ Next.js build (successful)
3. ✅ Data file validation (all JSON valid)
4. ✅ API field mapping (all required fields present)
5. ✅ Compound room parsing (7 test cases passed)
6. ✅ CodeQL security scan (0 vulnerabilities)

### Code Review Fixes Applied
1. Fixed compound room parsing for cases like "109-11"
2. Fixed time difference calculation (removed Math.abs, return signed value)
3. Fixed ciclo detection boundary logic (proper date range checks)

## What's NOT Implemented (By Design)
Phase 2 focuses on data models and logic only. These are deferred to Phase 3:
- ❌ UI components for search/filtering
- ❌ Interactive building map
- ❌ Calendar/schedule visualization
- ❌ User interface for availability display
- ❌ Search results page

## Repository Status
✅ **Ready for Phase 3 (UI Implementation)**

All core data models, parsing logic, and availability computation are complete. The next phase can focus entirely on building the user interface using the robust data layer established in Phase 2.

## Files Changed
- `types/index.ts`: Extended with Phase 2 types
- `lib/parse-courses.ts`: Complete rewrite with all Phase 2 features
- `lib/data-loader.ts`: New utility for metadata loading
- `lib/examples.ts`: New comprehensive examples
- `data/buildings-metadata.json`: New building metadata file
- `data/room-restrictions.json`: New room restrictions file
- `data/ciclos.json`: New ciclo definitions file
- `data/courses/courses-202610.json`: Updated sample data
- `data/courses/manifest.json`: Updated manifest
- `README.md`: Comprehensive Phase 2 documentation

## Lines of Code
- Types: ~200 lines
- Parser: ~600 lines
- Data Loader: ~60 lines
- Examples: ~400 lines
- Documentation: ~300 lines
- **Total: ~1,560 lines of new/updated code**

## Security
- ✅ CodeQL scan: 0 vulnerabilities
- ✅ No external dependencies added
- ✅ All data parsing uses safe TypeScript types
- ✅ No eval() or dynamic code execution

## Performance Considerations
- All parsing functions are O(n) or better
- Room grouping uses efficient Map structures
- Compound room parsing is O(1) per room
- No recursive algorithms (stack-safe)

## Next Steps (Phase 3)
1. Create search/filter UI components
2. Build interactive building map
3. Implement schedule calendar view
4. Add real-time availability display
5. Create main search results page

---

**Phase 2 Complete** ✅
