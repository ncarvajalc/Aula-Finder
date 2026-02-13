#!/usr/bin/env python3
"""
Fetch course sections from Universidad de los Andes API
(ofertadecursos.uniandes.edu.co) and save to data/courses/courses-TERM.json
"""

import json
import sys
from datetime import datetime
from pathlib import Path

import requests

API_URL = "https://ofertadecursos.uniandes.edu.co/api/courses"
PAGE_SIZE = 10000

# Buildings that don't represent a physical classroom
BUILDING_BLACKLIST = {
    "0", "", " -", "VIRT", "NOREQ", "SALA", "LIGA", "LAB",
    "FEDELLER", "FSFB", "HFONTIB", "HLSAMAR", "HLVICT",
    "HSBOLIV", "HSUBA", "IMI", "MEDLEG", "SVICENP", "ZIPAUF",
}

DAY_FIELDS = ["l", "m", "i", "j", "v", "s", "d"]


def safe_int(value) -> int:
    """Safely convert a value to int, returning 0 for non-numeric inputs."""
    if value is None:
        return 0
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0


def auto_detect_term() -> str:
    """Determine the current academic term based on today's date."""
    now = datetime.now()
    semester = "10" if now.month <= 6 else "20"
    return f"{now.year}{semester}"


def format_time(raw: str | None) -> str:
    """Convert API time like '0800' to 'HH:MM' format."""
    if not raw or len(raw) < 4:
        return ""
    return f"{raw[:2]}:{raw[2:4]}"


def parse_classroom(classroom: str | None) -> tuple[str, str]:
    """
    Parse the API classroom field into (building, room).
    Examples:
        '.ML_301'   -> ('ML', '301')
        '.RGD_206-7' -> ('RGD', '206-7')
        '.NOREQ'    -> ('NOREQ', '')
        None / ''   -> ('NOREQ', '')
    """
    if not classroom:
        return ("NOREQ", "")
    # Strip leading dot
    cleaned = classroom.lstrip(".")
    if "_" in cleaned:
        parts = cleaned.split("_", 1)
        return (parts[0], parts[1])
    return (cleaned, "")


def sanitize_building(building: str) -> str:
    """Map blacklisted buildings to NOREQ."""
    if building in BUILDING_BLACKLIST:
        return "NOREQ"
    return building


def extract_modality(attrs: list | None) -> str:
    """Derive modality from the attr list."""
    if not attrs:
        return "Presencial"
    attr_set = {a.upper() if isinstance(a, str) else "" for a in attrs}
    if "VIRTUAL" in attr_set or "VIRT" in attr_set:
        return "Virtual"
    if "HIBRIDO" in attr_set or "HÍBRIDO" in attr_set:
        return "Híbrido"
    return "Presencial"


def extract_language(attrs: list | None) -> str:
    """Derive language from the attr list."""
    if not attrs:
        return "Español"
    for a in attrs:
        if not isinstance(a, str):
            continue
        upper = a.upper()
        if "INGL" in upper or "ENGLISH" in upper:
            return "Inglés"
    return "Español"


def transform_schedules(raw_schedules: list | None) -> list[dict]:
    """Transform API schedule objects into our app format (one entry per day)."""
    if not raw_schedules:
        return []
    schedules = []
    for s in raw_schedules:
        start = format_time(s.get("time_ini"))
        end = format_time(s.get("time_fin"))
        building, room = parse_classroom(s.get("classroom"))
        building = sanitize_building(building)
        date_ini = s.get("date_ini", "")
        date_fin = s.get("date_fin", "")

        for field in DAY_FIELDS:
            day_val = s.get(field)
            if day_val:  # non-null means this day is active
                schedules.append({
                    "day": day_val.upper(),
                    "startTime": start,
                    "endTime": end,
                    "building": building,
                    "room": room,
                    "dateIni": date_ini,
                    "dateFin": date_fin,
                })
    return schedules


def transform_course(raw: dict) -> dict:
    """Transform a single raw API course into our app format."""
    instructors = raw.get("instructors") or []
    professors = ", ".join(
        inst["name"] for inst in instructors if inst.get("name")
    )

    course_code = raw.get("course", "")
    department = course_code[:4] if len(course_code) >= 4 else course_code

    attrs = raw.get("attr")
    modality = extract_modality(attrs)
    language = extract_language(attrs)

    schedules = transform_schedules(raw.get("schedules"))

    # If all schedule buildings are NOREQ, check modality
    if schedules and all(sc["building"] == "NOREQ" for sc in schedules):
        if modality == "Presencial":
            modality = "Virtual"

    return {
        "nrc": str(raw.get("nrc", "")),
        "llave": str(raw.get("llave", "")),
        "term": str(raw.get("term", "")),
        "ptrm": str(raw.get("ptrm", "")),
        "ptrmdesc": raw.get("ptrmdesc", ""),
        "class": str(raw.get("class", "")),
        "course": course_code,
        "title": raw.get("title", ""),
        "credits": safe_int(raw.get("credits")),
        "professors": professors,
        "schedules": schedules,
        "campus": raw.get("campus", ""),
        "maxenrol": safe_int(raw.get("maxenrol")),
        "enrolled": safe_int(raw.get("enrolled")),
        "seatsavail": safe_int(raw.get("seatsavail")),
        "modality": modality,
        "language": language,
        "department": department,
    }


def fetch_all_courses() -> list[dict]:
    """Fetch all courses from the API, handling pagination."""
    all_courses: list[dict] = []
    offset = 0

    while True:
        url = f"{API_URL}?offset={offset}&limit={PAGE_SIZE}"
        print(f"  Fetching offset={offset} limit={PAGE_SIZE} ...")
        resp = requests.get(url, timeout=120)
        resp.raise_for_status()
        data = resp.json()

        if not data:
            break

        all_courses.extend(data)
        print(f"  Received {len(data)} records (total so far: {len(all_courses)})")

        if len(data) < PAGE_SIZE:
            break
        offset += PAGE_SIZE

    return all_courses


def save_courses(courses: list[dict], term: str) -> None:
    """Save courses JSON and update manifest."""
    data_dir = Path(__file__).parent.parent / "data" / "courses"
    data_dir.mkdir(parents=True, exist_ok=True)

    filename = f"courses-{term}.json"
    filepath = data_dir / filename

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved {len(courses)} sections to {filepath}")

    unique_courses = set(c["course"] for c in courses)
    manifest = {
        "term": term,
        "timestamp": datetime.now().isoformat(),
        "filename": filename,
        "totalCourses": len(unique_courses),
        "totalSections": len(courses),
        "source": "ofertadecursos.uniandes.edu.co API",
    }

    manifest_path = data_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"✓ Updated manifest at {manifest_path}")


def main() -> None:
    if len(sys.argv) > 1:
        term = sys.argv[1]
    else:
        term = auto_detect_term()

    print(f"Starting course fetch for term {term}")
    print("=" * 50)

    try:
        raw_courses = fetch_all_courses()

        if not raw_courses:
            print("⚠ No courses returned from the API")
            sys.exit(1)

        print(f"\n✓ Fetched {len(raw_courses)} raw records from API")

        # Filter to requested term and validate
        term_courses = [c for c in raw_courses if str(c.get("term")) == term]
        other_terms = set(str(c.get("term")) for c in raw_courses) - {term}
        if other_terms:
            print(f"  Discarded records from other terms: {other_terms}")
        if not term_courses:
            available = set(str(c.get("term")) for c in raw_courses)
            print(f"✗ No courses found for term {term}. Available terms: {available}")
            sys.exit(1)
        print(f"  {len(term_courses)} records match term {term}")

        # Transform
        print("\nTransforming courses...")
        transformed = [transform_course(c) for c in term_courses]

        # Summary stats
        buildings = set()
        for c in transformed:
            for s in c["schedules"]:
                if s["building"] != "NOREQ":
                    buildings.add(s["building"])
        unique_courses = set(c["course"] for c in transformed)
        print(f"  {len(transformed)} sections, {len(unique_courses)} unique courses")
        print(f"  {len(buildings)} buildings: {', '.join(sorted(buildings)[:15])}{'...' if len(buildings) > 15 else ''}")

        # Save
        print()
        save_courses(transformed, term)

        print("=" * 50)
        print("✓ Course fetch completed successfully")

    except requests.RequestException as e:
        print(f"✗ API request failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
