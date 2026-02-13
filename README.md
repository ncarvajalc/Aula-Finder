# AulaFinder

> 🏫 Find available classrooms at Universidad de los Andes

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

AulaFinder is a modern web application that helps students and faculty at Universidad de los Andes find available classrooms based on real-time course schedule data.

## ✨ Features (Phase 1 - Foundation)

- ⚡ **Modern Stack**: Built with Next.js 14+ (App Router), TypeScript, and Tailwind CSS
- 📱 **Responsive Design**: Mobile-first design with dark mode support
- 🔄 **Automated Data Pipeline**: Python scripts to fetch and process course data
- 📊 **Type-Safe**: Full TypeScript type definitions for course and room data
- 🎨 **Design System**: Reusable UI components based on modern best practices
- 📦 **Static Export**: Deployable to GitHub Pages with no server required

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Python 3.11+ (for data scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/Open-Source-Uniandes/AulaFinder.git
cd AulaFinder

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
# Build static site
npm run build

# The static site will be in the 'out' directory
```

## 📁 Project Structure

```
AulaFinder/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with global styles
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with CSS variables
├── components/            # React components
│   └── ui/               # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── modal.tsx
├── lib/                   # Utility libraries
│   ├── utils.ts          # Utility functions
│   └── parse-courses.ts  # Course data parser
├── types/                 # TypeScript type definitions
│   └── index.ts          # Core types (CourseSection, Room, etc.)
├── data/                  # Data files
│   ├── courses/          # Course section data by term
│   │   ├── courses-YYYYMM.json
│   │   └── manifest.json
│   └── enums/            # Extracted enum values
│       ├── buildings.json
│       ├── departments.json
│       └── all-enums.json
├── scripts/               # Data pipeline scripts
│   ├── fetch-courses.py  # Fetch course data from API
│   └── analyze-enums.py  # Extract enum values
├── public/                # Static assets
│   └── images/
│       └── buildings/    # Building photos
└── .github/
    └── workflows/
        └── fetch-courses.yml  # Automated data updates
```

## 🛠 Data Pipeline

The data pipeline consists of Python scripts that fetch and process course data:

### Fetching Course Data

```bash
# Fetch courses for current term
python scripts/fetch-courses.py

# Fetch for specific term (YYYYMM format)
python scripts/fetch-courses.py 202610
```

This script:
- Fetches course sections from the API
- Saves data to `data/courses/courses-YYYYMM.json`
- Updates the manifest file with metadata

### Analyzing Enums

```bash
# Extract unique values from course data
python scripts/analyze-enums.py
```

This script:
- Parses the latest course data
- Extracts unique values for buildings, departments, modalities, etc.
- Saves enum files to `data/enums/`

### Automated Updates

The GitHub Actions workflow (`.github/workflows/fetch-courses.yml`) automatically:
- Runs at the beginning of each semester and mid-semester
- Fetches latest course data
- Commits updates to the repository
- Can be triggered manually for on-demand updates

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS:

- **Colors**: Theme-aware color system with dark mode support
- **Components**: Button, Card, Modal, and more
- **Utilities**: Helper functions for className merging (cn)
- **Typography**: Consistent font scales and spacing

All design tokens are defined in `tailwind.config.js` and can be customized.

## 📚 Type Definitions

TypeScript types are defined in `types/index.ts`:

- **CourseSection**: Complete course information including schedules
- **Schedule**: Individual class meeting time and location
- **RoomData**: Room occupancy information
- **BuildingData**: Building-level data aggregation
- **Enums**: Type-safe enums for all dropdown/filter values

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (static export)
- `npm run start` - Start production server (for testing)
- `npm run lint` - Run ESLint

### Code Style

- Use TypeScript for all new files
- Follow the existing component patterns
- Use Tailwind CSS for styling (no CSS modules or styled-components)
- Keep components small and focused

## 🚧 Roadmap

### Phase 1: Foundation ✅
- [x] Project scaffolding with Next.js 14+
- [x] Tailwind CSS and component system
- [x] TypeScript type definitions
- [x] Data pipeline scripts
- [x] GitHub Actions workflow

### Phase 2: Core Data Models & Logic ✅ (Current)
- [x] Enhanced course parser with full API field support
- [x] Ciclo (8A/8B/Full semester) handling
- [x] Building and room metadata system
- [x] Room availability logic with 10-minute gap rule
- [x] Compound room parsing (e.g., AU 103-4)
- [x] Room restriction and floor mapping

### Phase 3: UI Implementation (Next)
- [ ] Classroom search and filtering interface
- [ ] Interactive building map
- [ ] Schedule visualization
- [ ] Real-time availability display

### Phase 4: Advanced Features (Future)
- [ ] Room booking suggestions
- [ ] Schedule optimization
- [ ] Analytics and usage patterns
- [ ] API integration with Uniandes systems

## 📚 Phase 2 Documentation

### Data Models

#### Course Sections
Course sections are parsed from the Uniandes API with the following structure:

```typescript
interface CourseSection {
  // Core identifiers
  nrc: string;              // API: nrc (unique section identifier)
  llave?: string;           // API: llave (alternate course key)
  term: string;             // API: term (e.g., "202610")
  
  // Part-of-term (ciclo)
  ptrm: string;             // "1" (full), "8A" (first 8 weeks), "8B" (second 8 weeks)
  ptrmDesc?: string;        // Description of the part-of-term
  
  // Course info
  courseCode: string;       // API: course (e.g., "ISIS1001")
  courseName: string;       // API: title
  section: string;          // API: class
  credits: number;
  
  // Instructors
  professor: string;        // First professor
  professors?: string[];    // All professors (parsed from comma-separated)
  
  // Schedule and location
  schedules: Schedule[];
  campus: string;
  
  // Enrollment
  capacity: number;         // API: maxenrol
  enrolled: number;         // API: enrolled
  available: number;        // API: seatsavail
  
  modality: string;
  language: string;
  department: string;
  
  requiresClassroom: boolean; // false for .NOREQ rooms
}
```

#### Ciclo System

The **ciclo** system allows courses to be scheduled for:
- **Full Semester ("1")**: 16-week courses
- **First Half ("8A")**: First 8 weeks
- **Second Half ("8B")**: Second 8 weeks

**Example Usage:**
```typescript
import { groupByCiclo, filterByCiclo, getCurrentCiclo } from "@/lib/parse-courses";
import { getCicloData } from "@/lib/data-loader";

// Group all courses by ciclo
const cicloMap = groupByCiclo(sections);
const fullSemester = cicloMap.get("1") || [];
const firstHalf = cicloMap.get("8A") || [];
const secondHalf = cicloMap.get("8B") || [];

// Filter courses for a specific ciclo
const firstHalfCourses = filterByCiclo(sections, "8A");

// Determine current active ciclo based on today's date
const cicloData = getCicloData();
const currentCiclo = getCurrentCiclo("202610", cicloData);
```

#### Building & Room Structure

Buildings and rooms are organized with metadata, restrictions, and floor mapping:

```typescript
interface BuildingData {
  building: string;
  campus: string;
  metadata?: BuildingMetadata;  // Name, coordinates, image URL
  rooms: RoomData[];
}

interface RoomData {
  building: string;
  room: string;
  capacity?: number;
  floor?: number;              // Extracted from first digit
  isRestricted?: boolean;      // true for labs, offices
  restrictionNote?: string;
  occupancies: RoomOccupancy[];
}
```

**Compound Rooms**: Rooms like "AU 103-4" are automatically parsed into separate entries for rooms 103 and 104, with both showing the course occupancy.

**Example Usage:**
```typescript
import { groupByRoom } from "@/lib/parse-courses";
import { getBuildingMetadata, getRoomRestrictions } from "@/lib/data-loader";

const metadata = getBuildingMetadata();
const restrictions = getRoomRestrictions();
const buildings = groupByRoom(sections, metadata, restrictions);

// Buildings are sorted by display order (whitelisted first)
// Rooms within buildings are sorted by floor, then alphabetically
```

### Availability Logic

The availability system provides real-time room status with a **10-minute gap rule**: rooms are not shown as available if the time gap between classes is less than 10 minutes.

**Example Usage:**

```typescript
import { 
  checkRoomAvailability, 
  findAvailableSlots,
  getTimeBlocks 
} from "@/lib/parse-courses";

// Check if a room is available at a specific time
const availability = checkRoomAvailability(roomData, {
  building: "ML",
  room: "301",
  day: "L",          // L, M, I, J, V, S, D
  time: "14:30",
  ptrm: "8A",        // Optional: filter by ciclo
  respectGapRule: true  // Apply 10-minute gap rule
});

if (availability.isAvailable) {
  console.log("Room is available!");
  if (availability.nextStateChange) {
    console.log(`Will be occupied at ${availability.nextStateChange.time}`);
  }
} else {
  console.log("Room is occupied by:", availability.currentOccupancy);
  console.log(`Will be free at ${availability.nextStateChange?.time}`);
}

// Check if a time slot is available
const isAvailable = findAvailableSlots(
  roomData, 
  "L",           // Monday
  "14:00",       // Start time
  "16:00",       // End time
  "1"            // Full semester courses only
);

// Get time blocks for calendar display
const blocks = getTimeBlocks(
  roomData,
  "L",           // Day
  "07:00",       // Start of day
  "20:00",       // End of day
  "8A"           // Filter by ciclo (optional)
);

blocks.forEach(block => {
  if (block.isOccupied) {
    console.log(`${block.startTime}-${block.endTime}: ${block.occupancy.courseCode}`);
  } else {
    console.log(`${block.startTime}-${block.endTime}: Available`);
  }
});
```

### Schedule Day Codes

All day codes are parsed and normalized:
- **L**: Lunes (Monday)
- **M**: Martes (Tuesday)
- **I**: Miércoles (Wednesday)
- **J**: Jueves (Thursday)
- **V**: Viernes (Friday)
- **S**: Sábado (Saturday)
- **D**: Domingo (Sunday)

The parser handles various formats: "L", "LM", "L-M", "lm", etc.

### Virtual vs Physical Courses

Courses are automatically categorized:

```typescript
import { getVirtualSections, getPhysicalSections } from "@/lib/parse-courses";

// Get courses that don't need a physical classroom
const virtualCourses = getVirtualSections(sections);

// Get courses that require a classroom
const physicalCourses = getPhysicalSections(sections);
```

Courses with `.NOREQ` rooms are kept in the data but flagged as not requiring a classroom.



## 🤝 Contributing

Contributions are welcome! This is an Open Source Uniandes project.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🏛 About Open Source Uniandes

This project is developed and maintained by Open Source Uniandes, a student organization promoting open-source culture and collaborative software development at Universidad de los Andes.

---

**Note**: Phase 1 established the foundation, and Phase 2 has implemented the core data models, parser, and availability logic. The repository is now ready for Phase 3 (UI implementation). No UI screens or calendar rendering have been implemented yet — all changes are in the data layer.