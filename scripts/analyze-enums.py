#!/usr/bin/env python3
"""
Analyze course data and extract unique enum values
Writes to data/enums/*.json
"""

import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

def load_latest_courses():
    """
    Load the most recent courses data file
    
    Returns:
        List of course sections
    """
    data_dir = Path(__file__).parent.parent / "data" / "courses"
    manifest_path = data_dir / "manifest.json"
    
    if not manifest_path.exists():
        print("⚠ No manifest found. Run fetch-courses.py first.")
        return []
    
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    
    courses_file = data_dir / manifest["filename"]
    
    if not courses_file.exists():
        print(f"⚠ Courses file not found: {courses_file}")
        return []
    
    with open(courses_file, 'r', encoding='utf-8') as f:
        courses = json.load(f)
    
    print(f"✓ Loaded {len(courses)} course sections from {manifest['filename']}")
    return courses

def extract_enums(courses: list):
    """
    Extract unique values for each enum field
    
    Args:
        courses: List of course sections
        
    Returns:
        Dictionary of enum field names to lists of unique values
    """
    enums = {
        "buildings": set(),
        "departments": set(),
        "modalities": set(),
        "campuses": set(),
        "languages": set(),
        "days": set(),
    }
    
    for course in courses:
        # Extract direct fields
        if course.get("department"):
            enums["departments"].add(course["department"])
        if course.get("modality"):
            enums["modalities"].add(course["modality"])
        if course.get("campus"):
            enums["campuses"].add(course["campus"])
        if course.get("language"):
            enums["languages"].add(course["language"])
        
        # Extract from schedules
        for schedule in course.get("schedules", []):
            if schedule.get("building"):
                enums["buildings"].add(schedule["building"])
            if schedule.get("day"):
                enums["days"].add(schedule["day"])
    
    # Convert sets to sorted lists
    result = {
        key: sorted(list(values)) 
        for key, values in enums.items()
    }
    
    return result

def save_enums(enums: dict):
    """
    Save enum data to individual JSON files
    
    Args:
        enums: Dictionary of enum field names to lists of values
    """
    enums_dir = Path(__file__).parent.parent / "data" / "enums"
    enums_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().isoformat()
    
    # Save each enum to its own file
    for field, values in enums.items():
        filename = f"{field}.json"
        filepath = enums_dir / filename
        
        data = {
            "field": field,
            "values": values,
            "count": len(values),
            "timestamp": timestamp
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Saved {len(values)} {field} to {filepath}")
    
    # Save combined enums file
    combined_path = enums_dir / "all-enums.json"
    combined_data = {
        **enums,
        "timestamp": timestamp
    }
    
    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Saved combined enums to {combined_path}")

def main():
    """Main execution function"""
    print("Starting enum analysis")
    print("=" * 50)
    
    try:
        # Load courses data
        courses = load_latest_courses()
        
        if not courses:
            print("⚠ No courses to analyze")
            return
        
        # Extract enums
        enums = extract_enums(courses)
        
        # Display summary
        print("\nEnum summary:")
        for field, values in enums.items():
            print(f"  {field}: {len(values)} unique values")
        
        # Save enums
        print("\nSaving enum files...")
        save_enums(enums)
        
        print("=" * 50)
        print("✓ Enum analysis completed successfully")
        
    except Exception as e:
        print(f"✗ Error analyzing enums: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
