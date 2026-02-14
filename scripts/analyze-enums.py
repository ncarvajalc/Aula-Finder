#!/usr/bin/env python3
"""
Analyze course data and extract unique enum values and detailed statistics.
Writes to data/enums/*.json

This script performs comprehensive analysis of the course data including:
- Unique values for all categorical fields (buildings, departments, etc.)
- Statistics (total courses, sections, enrollment, etc.)
- Per-building room listings
- Professor counts
- Attribute analysis
- PTRM (ciclo) date ranges inferred from schedule data
"""

import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict


def load_latest_courses():
    """Load the most recent courses data file."""
    data_dir = Path(__file__).parent.parent / "data" / "courses"
    manifest_path = data_dir / "manifest.json"

    if not manifest_path.exists():
        print("⚠ No manifest found. Run fetch-courses.py first.")
        return [], {}

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    courses_file = data_dir / manifest["filename"]

    if not courses_file.exists():
        print(f"⚠ Courses file not found: {courses_file}")
        return [], manifest

    with open(courses_file, "r", encoding="utf-8") as f:
        courses = json.load(f)

    print(f"✓ Loaded {len(courses)} course sections from {manifest['filename']}")
    return courses, manifest


def extract_enums(courses: list) -> dict:
    """Extract unique values for each enum field."""
    enums: dict[str, set] = {
        "buildings": set(),
        "departments": set(),
        "modalities": set(),
        "campuses": set(),
        "languages": set(),
        "days": set(),
    }

    for course in courses:
        if course.get("department"):
            enums["departments"].add(course["department"])
        if course.get("modality"):
            enums["modalities"].add(course["modality"])
        if course.get("campus"):
            enums["campuses"].add(course["campus"])
        if course.get("language"):
            enums["languages"].add(course["language"])

        for schedule in course.get("schedules", []):
            if schedule.get("building"):
                enums["buildings"].add(schedule["building"])
            if schedule.get("day"):
                enums["days"].add(schedule["day"])

    return {key: sorted(list(values)) for key, values in enums.items()}


def extract_statistics(courses: list) -> dict:
    """Extract comprehensive statistics from course data."""
    unique_courses = set()
    unique_nrcs = set()
    unique_professors = set()
    building_rooms: dict[str, set] = defaultdict(set)
    department_counts: dict[str, int] = defaultdict(int)
    ptrm_counts: dict[str, int] = defaultdict(int)
    ptrm_dates: dict[str, dict] = defaultdict(lambda: {"starts": set(), "ends": set()})
    language_counts: dict[str, int] = defaultdict(int)
    total_enrolled = 0
    total_capacity = 0
    attributes: dict[str, int] = defaultdict(int)

    for course in courses:
        unique_courses.add(course.get("course", ""))
        unique_nrcs.add(course.get("nrc", ""))

        profs = course.get("professors", "")
        if profs:
            for p in profs.split(","):
                p = p.strip()
                if p:
                    unique_professors.add(p)

        dept = course.get("department", "")
        if dept:
            department_counts[dept] += 1

        ptrm = course.get("ptrm", "1")
        ptrm_counts[ptrm] += 1

        lang = course.get("language", "Español")
        language_counts[lang] += 1

        total_enrolled += int(course.get("enrolled", 0) or 0)
        total_capacity += int(course.get("maxenrol", 0) or 0)

        # Track title-based English detection
        title = course.get("title", "").upper()
        if "INGLÉS" in title or "INGLES" in title:
            if lang != "Inglés":
                language_counts["Inglés (por título)"] = language_counts.get("Inglés (por título)", 0) + 1

        for schedule in course.get("schedules", []):
            bldg = schedule.get("building", "")
            room = schedule.get("room", "")
            if bldg and room and bldg != "NOREQ" and room != "NOREQ":
                building_rooms[bldg].add(room)

            # Collect ptrm date ranges
            date_ini = schedule.get("dateIni", "")
            date_fin = schedule.get("dateFin", "")
            if date_ini:
                ptrm_dates[ptrm]["starts"].add(date_ini[:10])
            if date_fin:
                ptrm_dates[ptrm]["ends"].add(date_fin[:10])

    # Build ptrm summary with inferred dates
    ptrm_summary = {}
    for ptrm, dates in sorted(ptrm_dates.items()):
        starts = sorted(dates["starts"])
        ends = sorted(dates["ends"])
        ptrm_summary[ptrm] = {
            "count": ptrm_counts.get(ptrm, 0),
            "inferredStartDate": starts[0] if starts else None,
            "inferredEndDate": ends[-1] if ends else None,
        }

    # Build per-building room counts
    rooms_by_building = {
        bldg: sorted(list(rooms)) for bldg, rooms in sorted(building_rooms.items())
    }

    return {
        "totalSections": len(courses),
        "totalUniqueCourses": len(unique_courses),
        "totalUniqueNRCs": len(unique_nrcs),
        "totalUniqueProfessors": len(unique_professors),
        "totalBuildings": len(building_rooms),
        "totalRooms": sum(len(rooms) for rooms in building_rooms.values()),
        "totalEnrolled": total_enrolled,
        "totalCapacity": total_capacity,
        "ptrmSummary": ptrm_summary,
        "departmentCounts": dict(sorted(department_counts.items(), key=lambda x: -x[1])),
        "languageCounts": dict(sorted(language_counts.items(), key=lambda x: -x[1])),
        "roomsByBuilding": rooms_by_building,
        "professors": sorted(list(unique_professors)),
    }


def save_enums(enums: dict, statistics: dict):
    """Save enum data and statistics to individual JSON files."""
    enums_dir = Path(__file__).parent.parent / "data" / "enums"
    enums_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().isoformat()

    # Save each enum to its own file
    for field, values in enums.items():
        filepath = enums_dir / f"{field}.json"
        data = {
            "field": field,
            "values": values,
            "count": len(values),
            "timestamp": timestamp,
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✓ Saved {len(values)} {field} to {filepath}")

    # Save statistics
    stats_path = enums_dir / "statistics.json"
    stats_data = {
        **statistics,
        "timestamp": timestamp,
    }
    # Remove large lists from the main stats file for readability
    stats_summary = {k: v for k, v in stats_data.items() if k not in ("professors", "roomsByBuilding")}
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats_summary, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved statistics to {stats_path}")

    # Save detailed artifacts separately
    professors_path = enums_dir / "professors.json"
    with open(professors_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "field": "professors",
                "values": statistics["professors"],
                "count": len(statistics["professors"]),
                "timestamp": timestamp,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    print(f"✓ Saved {len(statistics['professors'])} professors to {professors_path}")

    rooms_path = enums_dir / "rooms_by_building.json"
    with open(rooms_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "field": "rooms_by_building",
                "data": statistics["roomsByBuilding"],
                "totalBuildings": len(statistics["roomsByBuilding"]),
                "totalRooms": sum(
                    len(rooms) for rooms in statistics["roomsByBuilding"].values()
                ),
                "timestamp": timestamp,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    print(f"✓ Saved rooms by building to {rooms_path}")


def main():
    """Main execution function."""
    print("Starting enum analysis and statistics extraction")
    print("=" * 50)

    try:
        courses, manifest = load_latest_courses()

        if not courses:
            print("⚠ No courses to analyze")
            return

        # Extract enums
        enums = extract_enums(courses)

        # Extract statistics
        statistics = extract_statistics(courses)

        # Display summary
        print("\nEnum summary:")
        for field, values in enums.items():
            print(f"  {field}: {len(values)} unique values")

        print(f"\nStatistics:")
        print(f"  Sections: {statistics['totalSections']}")
        print(f"  Unique courses: {statistics['totalUniqueCourses']}")
        print(f"  Unique NRCs: {statistics['totalUniqueNRCs']}")
        print(f"  Professors: {statistics['totalUniqueProfessors']}")
        print(f"  Buildings: {statistics['totalBuildings']}")
        print(f"  Rooms: {statistics['totalRooms']}")
        print(f"  Total enrolled: {statistics['totalEnrolled']}")
        print(f"  Total capacity: {statistics['totalCapacity']}")

        print(f"\nPTRM summary:")
        for ptrm, info in statistics["ptrmSummary"].items():
            print(
                f"  {ptrm}: {info['count']} sections, "
                f"{info['inferredStartDate']} → {info['inferredEndDate']}"
            )

        # Save enums and statistics
        print("\nSaving enum files and statistics...")
        save_enums(enums, statistics)

        print("=" * 50)
        print("✓ Enum analysis completed successfully")

    except Exception as e:
        print(f"✗ Error analyzing enums: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()

