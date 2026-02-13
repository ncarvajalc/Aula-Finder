#!/usr/bin/env python3
"""
Fetch course sections from Universidad de los Andes API
Saves to src/data/courses/courses-YYYYMM.json with manifest
"""

import json
import os
from datetime import datetime
from pathlib import Path
import sys

# Note: This is a template script. The actual API endpoint and authentication
# should be configured based on Universidad de los Andes requirements.

# Placeholder API endpoint - update with actual endpoint
API_ENDPOINT = "https://api.uniandes.edu.co/courses/sections"

def fetch_courses_from_api(term: str):
    """
    Fetch course data from the API
    
    Args:
        term: Academic term in format YYYYMM (e.g., 202610 for 2026-1)
    
    Returns:
        List of course sections
    """
    print(f"Fetching courses for term {term}...")
    
    # TODO: Implement actual API call
    # Example using requests library:
    # import requests
    # response = requests.get(f"{API_ENDPOINT}?term={term}", headers={...})
    # return response.json()
    
    # For now, return example data structure
    return [
        {
            "nrc": "12345",
            "courseCode": "ISIS1001",
            "courseName": "Fundamentos de Programación",
            "section": "1",
            "credits": 3,
            "professor": "John Doe",
            "schedules": [
                {
                    "day": "L",
                    "startTime": "08:00",
                    "endTime": "09:30",
                    "building": "ML",
                    "room": "301"
                },
                {
                    "day": "I",
                    "startTime": "08:00",
                    "endTime": "09:30",
                    "building": "ML",
                    "room": "301"
                }
            ],
            "campus": "Principal",
            "capacity": 40,
            "enrolled": 35,
            "available": 5,
            "modality": "Presencial",
            "language": "Español",
            "department": "Ingeniería de Sistemas"
        }
    ]

def save_courses(courses: list, term: str):
    """
    Save courses to JSON file and update manifest
    
    Args:
        courses: List of course sections
        term: Academic term in format YYYYMM
    """
    # Ensure data directory exists
    data_dir = Path(__file__).parent.parent / "data" / "courses"
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Save courses to file
    filename = f"courses-{term}.json"
    filepath = data_dir / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Saved {len(courses)} course sections to {filepath}")
    
    # Update manifest
    manifest = {
        "term": term,
        "timestamp": datetime.now().isoformat(),
        "filename": filename,
        "totalCourses": len(set(c.get("courseCode", "") for c in courses)),
        "totalSections": len(courses)
    }
    
    manifest_path = data_dir / "manifest.json"
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Updated manifest at {manifest_path}")

def main():
    """Main execution function"""
    # Get term from command line or use current term
    if len(sys.argv) > 1:
        term = sys.argv[1]
    else:
        # Calculate current academic term (YYYYMM format)
        now = datetime.now()
        year = now.year
        # Semester 1: January-June, Semester 2: July-December
        semester = "10" if now.month <= 6 else "20"
        term = f"{year}{semester}"
    
    print(f"Starting course fetch for term {term}")
    print("=" * 50)
    
    try:
        # Fetch courses from API
        courses = fetch_courses_from_api(term)
        
        if not courses:
            print("⚠ No courses found")
            return
        
        # Save courses and update manifest
        save_courses(courses, term)
        
        print("=" * 50)
        print("✓ Course fetch completed successfully")
        
    except Exception as e:
        print(f"✗ Error fetching courses: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
