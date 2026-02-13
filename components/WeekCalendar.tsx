"use client";

import { RoomOccupancy } from "@/types";
import { useState, useEffect } from "react";

interface WeekCalendarProps {
  occupancies: RoomOccupancy[];
  buildingCode: string;
  roomCode: string;
}

// Day abbreviations mapping
const DAY_NAMES: Record<string, string> = {
  L: "Lunes",
  M: "Martes",
  I: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
};

const DAYS_ORDER = ["L", "M", "I", "J", "V", "S", "D"];

// Time range 6:00 - 22:00 (16 hours)
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS_RANGE = END_HOUR - START_HOUR;
const PIXELS_PER_HOUR = 60; // Height in pixels per hour

// Color palette for different courses
const COURSE_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-cyan-100 border-cyan-300 text-cyan-900",
  "bg-amber-100 border-amber-300 text-amber-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
];

export default function WeekCalendar({ occupancies, buildingCode, roomCode }: WeekCalendarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<RoomOccupancy | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Get unique courses for color assignment
  const uniqueCourses = Array.from(new Set(occupancies.map(o => o.courseCode)));
  const courseColorMap = new Map<string, string>();
  uniqueCourses.forEach((course, idx) => {
    courseColorMap.set(course, COURSE_COLORS[idx % COURSE_COLORS.length]);
  });

  // Group occupancies by day
  const occupanciesByDay = new Map<string, RoomOccupancy[]>();
  DAYS_ORDER.forEach(day => {
    occupanciesByDay.set(day, occupancies.filter(o => o.day === day));
  });

  // Convert time string to pixel position
  const timeToPixels = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    const totalHours = hours + minutes / 60 - START_HOUR;
    return totalHours * PIXELS_PER_HOUR;
  };

  // Get current time indicator position
  const getCurrentTimePosition = (): number | null => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < START_HOUR || hours >= END_HOUR) return null;
    const totalHours = hours + minutes / 60 - START_HOUR;
    return totalHours * PIXELS_PER_HOUR;
  };

  // Check if current time is today
  const getCurrentDay = (): string | null => {
    const dayIndex = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayMap = ["D", "L", "M", "I", "J", "V", "S"]; // Sunday to Saturday
    return dayMap[dayIndex] || null;
  };

  const currentTimePosition = getCurrentTimePosition();
  const currentDay = getCurrentDay();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
          <div className="p-2 font-semibold text-center border-r bg-muted">Hora</div>
          {DAYS_ORDER.map(day => (
            <div key={day} className="p-2 font-semibold text-center border-r">
              <div className="hidden sm:block">{DAY_NAMES[day]}</div>
              <div className="sm:hidden">{day}</div>
              {day === currentDay && (
                <div className="text-xs text-primary font-normal">Hoy</div>
              )}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-8 relative" style={{ height: `${HOURS_RANGE * PIXELS_PER_HOUR}px` }}>
          {/* Time column */}
          <div className="border-r bg-muted/30">
            {Array.from({ length: HOURS_RANGE }, (_, i) => {
              const hour = START_HOUR + i;
              return (
                <div
                  key={hour}
                  className="border-b text-xs p-1 text-center"
                  style={{ height: `${PIXELS_PER_HOUR}px` }}
                >
                  {hour}:00
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {DAYS_ORDER.map(day => {
            const dayOccupancies = occupanciesByDay.get(day) || [];
            return (
              <div key={day} className="border-r relative">
                {/* Hour grid lines */}
                {Array.from({ length: HOURS_RANGE }, (_, i) => (
                  <div
                    key={i}
                    className="border-b"
                    style={{ height: `${PIXELS_PER_HOUR}px` }}
                  />
                ))}

                {/* Occupancy blocks */}
                {dayOccupancies.map((occupancy, idx) => {
                  const top = timeToPixels(occupancy.startTime);
                  const bottom = timeToPixels(occupancy.endTime);
                  const height = bottom - top;
                  const colorClass = courseColorMap.get(occupancy.courseCode) || COURSE_COLORS[0];

                  return (
                    <div
                      key={idx}
                      className={`absolute left-0 right-0 mx-1 border-l-4 rounded p-1 cursor-pointer hover:shadow-lg transition-shadow ${colorClass}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                      onClick={() => setSelectedBlock(occupancy)}
                    >
                      <div className="text-xs font-semibold truncate">
                        {occupancy.courseCode}
                      </div>
                      <div className="text-xs truncate">{occupancy.courseName}</div>
                      <div className="text-xs text-muted-foreground">
                        {occupancy.startTime} - {occupancy.endTime}
                      </div>
                      {height > 60 && (
                        <div className="text-xs truncate mt-1">{occupancy.professor}</div>
                      )}
                    </div>
                  );
                })}

                {/* Current time indicator */}
                {currentTimePosition !== null && day === currentDay && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                    style={{ top: `${currentTimePosition}px` }}
                  >
                    <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBlock && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBlock(null)}
        >
          <div
            className="bg-background border rounded-lg p-6 max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">{selectedBlock.courseName}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Código:</span> {selectedBlock.courseCode}
              </div>
              <div>
                <span className="font-semibold">Sección:</span> {selectedBlock.section}
              </div>
              <div>
                <span className="font-semibold">NRC:</span> {selectedBlock.nrc}
              </div>
              <div>
                <span className="font-semibold">Profesor:</span> {selectedBlock.professor}
              </div>
              <div>
                <span className="font-semibold">Horario:</span> {DAY_NAMES[selectedBlock.day]},{" "}
                {selectedBlock.startTime} - {selectedBlock.endTime}
              </div>
              <div>
                <span className="font-semibold">Modalidad:</span> {selectedBlock.modality}
              </div>
              <div>
                <span className="font-semibold">Ciclo:</span> {selectedBlock.ptrm === "1" ? "Semestre Completo" : selectedBlock.ptrm === "8A" ? "Primera Mitad" : "Segunda Mitad"}
              </div>
              <div>
                <span className="font-semibold">Salón:</span> {buildingCode} {roomCode}
              </div>
            </div>
            <button
              onClick={() => setSelectedBlock(null)}
              className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
