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

### Phase 1: Foundation ✅ (Current)
- [x] Project scaffolding with Next.js 14+
- [x] Tailwind CSS and component system
- [x] TypeScript type definitions
- [x] Data pipeline scripts
- [x] GitHub Actions workflow

### Phase 2: Core Features (Next)
- [ ] Classroom search and filtering
- [ ] Interactive building map
- [ ] Schedule visualization
- [ ] Real-time availability display

### Phase 3: Advanced Features (Future)
- [ ] Room booking suggestions
- [ ] Schedule optimization
- [ ] Analytics and usage patterns
- [ ] API integration with Uniandes systems

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

**Note**: This is Phase 1 of the project. Main features and UI screens will be implemented in subsequent phases. The current version provides the foundation, data pipeline, and type system for future development.