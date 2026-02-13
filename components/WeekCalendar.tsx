"use client";

import { RoomOccupancy } from "@/types";
import { useState, useEffect } from "react";

interface WeekCalendarProps {
  occupancies: RoomOccupancy[];
  buildingCode: string;
  roomCode: string;
}

const DAY_NAMES: Record<string, string> = {
  L: "Lun",
  M: "Mar",
  I: "Mié",
  J: "Jue",
  V: "Vie",
  S: "Sáb",
};

const DAY_FULL_NAMES: Record<string, string> = {
  L: "Lunes",
  M: "Martes",
  I: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
};

const DAYS_ORDER = ["L", "M", "I", "J", "V", "S"];

const START_HOUR = 6;
const END_HOUR = 22;
const HOURS_RANGE = END_HOUR - START_HOUR;
const PIXELS_PER_HOUR = 60;

const COURSE_COLORS = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-900" },
  { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-900" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-900" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-900" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-900" },
  { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-900" },
  { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-900" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-900" },
  { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-900" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-900" },
];

export default function WeekCalendar({ occupancies, buildingCode, roomCode }: WeekCalendarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<RoomOccupancy | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Color assignment per course
  const uniqueCourses = Array.from(new Set(occupancies.map((o) => o.courseCode)));
  const courseColorMap = new Map<string, typeof COURSE_COLORS[0]>();
  uniqueCourses.forEach((course, idx) => {
    courseColorMap.set(course, COURSE_COLORS[idx % COURSE_COLORS.length]);
  });

  // Filter to only show days that have data (keep at least M-V)
  const activeDays = DAYS_ORDER.filter((day) => {
    if (["L", "M", "I", "J", "V"].includes(day)) return true;
    return occupancies.some((o) => o.day === day);
  });

  const occupanciesByDay = new Map<string, RoomOccupancy[]>();
  activeDays.forEach((day) => {
    occupanciesByDay.set(day, occupancies.filter((o) => o.day === day));
  });

  // Time to pixel position - use exact calculation based on START_HOUR
  const timeToY = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return (hours - START_HOUR + minutes / 60) * PIXELS_PER_HOUR;
  };

  // Current time indicator
  const now = currentTime;
  const nowHour = now.getHours();
  const nowMin = now.getMinutes();
  const nowY = nowHour >= START_HOUR && nowHour < END_HOUR
    ? (nowHour - START_HOUR + nowMin / 60) * PIXELS_PER_HOUR
    : null;

  const todayDay = (() => {
    const dayIndex = now.getDay();
    const map = ["D", "L", "M", "I", "J", "V", "S"];
    return map[dayIndex];
  })();

  return (
    <div>
      <div className="overflow-x-auto -mx-4 px-4">
        <div style={{ minWidth: `${activeDays.length * 120 + 60}px` }}>
          {/* Header */}
          <div className="flex border-b">
            <div className="w-[60px] shrink-0 p-2 text-xs text-muted-foreground text-center font-medium">
              Hora
            </div>
            {activeDays.map((day) => (
              <div
                key={day}
                className={`flex-1 p-2 text-center text-sm font-medium border-l ${
                  day === todayDay ? "bg-uniandes-yellow/10 text-uniandes-dark" : ""
                }`}
              >
                <span className="hidden sm:inline">{DAY_FULL_NAMES[day]}</span>
                <span className="sm:hidden">{DAY_NAMES[day]}</span>
                {day === todayDay && (
                  <div className="text-[10px] text-uniandes-dark/60 font-normal">Hoy</div>
                )}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div className="flex relative" style={{ height: `${HOURS_RANGE * PIXELS_PER_HOUR}px` }}>
            {/* Time labels column */}
            <div className="w-[60px] shrink-0 relative">
              {Array.from({ length: HOURS_RANGE }, (_, i) => {
                const hour = START_HOUR + i;
                return (
                  <div
                    key={hour}
                    className="absolute w-full text-[11px] text-muted-foreground text-right pr-2"
                    style={{ top: `${i * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}
                  >
                    {hour}:00
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {activeDays.map((day) => {
              const dayOccupancies = occupanciesByDay.get(day) || [];
              return (
                <div
                  key={day}
                  className={`flex-1 relative border-l ${
                    day === todayDay ? "bg-uniandes-yellow/5" : ""
                  }`}
                >
                  {/* Hour grid lines */}
                  {Array.from({ length: HOURS_RANGE }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-b border-border/50"
                      style={{ top: `${i * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}
                    />
                  ))}

                  {/* Half-hour grid lines */}
                  {Array.from({ length: HOURS_RANGE }, (_, i) => (
                    <div
                      key={`half-${i}`}
                      className="absolute w-full border-b border-border/20"
                      style={{ top: `${(i + 0.5) * PIXELS_PER_HOUR}px` }}
                    />
                  ))}

                  {/* Course blocks */}
                  {dayOccupancies.map((occ, idx) => {
                    const top = timeToY(occ.startTime);
                    const height = timeToY(occ.endTime) - top;
                    const colors = courseColorMap.get(occ.courseCode) || COURSE_COLORS[0];

                    return (
                      <div
                        key={idx}
                        className={`absolute left-1 right-1 rounded-md border-l-[3px] px-1.5 py-1 cursor-pointer
                          hover:shadow-md transition-shadow overflow-hidden
                          ${colors.bg} ${colors.border} ${colors.text}`}
                        style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
                        onClick={() => setSelectedBlock(occ)}
                        title={`${occ.courseCode} - ${occ.courseName}\n${occ.startTime}–${occ.endTime}\n${occ.professor}`}
                      >
                        <div className="text-[11px] font-semibold truncate leading-tight">
                          {occ.courseCode}
                        </div>
                        {height > 35 && (
                          <div className="text-[10px] truncate leading-tight opacity-80">
                            {occ.courseName}
                          </div>
                        )}
                        {height > 50 && (
                          <div className="text-[10px] truncate leading-tight opacity-60">
                            {occ.startTime}–{occ.endTime}
                          </div>
                        )}
                        {height > 65 && (
                          <div className="text-[10px] truncate leading-tight opacity-60">
                            {occ.professor?.split(",")[0]}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Current time line */}
                  {nowY !== null && day === todayDay && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${nowY}px` }}
                    >
                      <div className="relative">
                        <div className="absolute -left-[3px] -top-[4px] w-[8px] h-[8px] bg-red-500 rounded-full" />
                        <div className="h-[2px] bg-red-500 w-full" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBlock && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBlock(null)}
        >
          <div
            className="bg-card border rounded-xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">{selectedBlock.courseName}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedBlock.courseCode} · Sección {selectedBlock.section}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">NRC</span>
                <span className="font-medium">{selectedBlock.nrc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profesor</span>
                <span className="font-medium text-right max-w-[60%] truncate">{selectedBlock.professor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horario</span>
                <span className="font-medium">
                  {DAY_FULL_NAMES[selectedBlock.day]} {selectedBlock.startTime}–{selectedBlock.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salón</span>
                <span className="font-medium">{buildingCode} {roomCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ciclo</span>
                <span className="font-medium">
                  {selectedBlock.ptrm === "1" ? "Semestre completo"
                    : selectedBlock.ptrm === "8A" ? "Ciclo 8A (1ª mitad)"
                    : selectedBlock.ptrm === "8B" ? "Ciclo 8B (2ª mitad)"
                    : selectedBlock.ptrm}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBlock(null)}
              className="mt-6 w-full px-4 py-2 bg-uniandes-dark text-white rounded-lg hover:bg-uniandes-dark/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
