"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DayOfWeek, PartOfTerm } from "@/types";
import manifestData from "@/data/courses/manifest.json";
import ciclosData from "@/data/ciclos.json";
import { getCurrentCiclo } from "@/lib/parse-courses";

const DAY_CODES: DayOfWeek[] = ["L", "M", "I", "J", "V", "S", "D"];

export function getCurrentDayCode(): DayOfWeek {
  const dayIndex = new Date().getDay();
  const map: DayOfWeek[] = ["D", "L", "M", "I", "J", "V", "S"];
  return map[dayIndex] || "L";
}

export function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function isValidDay(d: string | null): d is DayOfWeek {
  return d !== null && DAY_CODES.includes(d as DayOfWeek);
}

function isValidTime(t: string | null): boolean {
  return t !== null && /^\d{2}:\d{2}$/.test(t);
}

function isValidCiclo(c: string | null): c is PartOfTerm | "all" {
  return c !== null && ["all", "1", "8A", "8B"].includes(c);
}

/**
 * Shared hook for time/day/ciclo state that persists via URL query parameters.
 * When the user manually adjusts day/time, the values are stored in the URL
 * so they survive navigation between pages.
 * Pressing "Ir a ahora" clears the params and re-enables auto-update.
 */
export function useTimeState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial values from URL or use current time
  const urlDay = searchParams.get("day");
  const urlTime = searchParams.get("time");
  const urlCiclo = searchParams.get("ciclo");

  const hasUrlOverride = isValidDay(urlDay) || isValidTime(urlTime);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    isValidDay(urlDay) ? urlDay : getCurrentDayCode()
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    isValidTime(urlTime) ? urlTime! : getCurrentTime()
  );
  const [isAutoTime, setIsAutoTime] = useState(!hasUrlOverride);
  const [selectedCiclo, setSelectedCiclo] = useState<PartOfTerm | "all">(
    isValidCiclo(urlCiclo) ? urlCiclo : getCurrentCiclo(manifestData.term, ciclosData)
  );

  // Sync URL params when state changes (only for manual overrides)
  const updateUrlParams = useCallback(
    (day: DayOfWeek, time: string, ciclo: PartOfTerm | "all", auto: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (auto) {
        params.delete("day");
        params.delete("time");
        params.delete("ciclo");
      } else {
        params.set("day", day);
        params.set("time", time);
        if (ciclo !== getCurrentCiclo(manifestData.term, ciclosData)) {
          params.set("ciclo", ciclo);
        } else {
          params.delete("ciclo");
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Auto-update time every 30 seconds when in auto mode
  useEffect(() => {
    if (!isAutoTime) return;
    const interval = setInterval(() => {
      setSelectedDay(getCurrentDayCode());
      setSelectedTime(getCurrentTime());
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoTime]);

  const handleDayChange = useCallback(
    (day: DayOfWeek) => {
      setIsAutoTime(false);
      setSelectedDay(day);
      updateUrlParams(day, selectedTime, selectedCiclo, false);
    },
    [selectedTime, selectedCiclo, updateUrlParams]
  );

  const handleTimeChange = useCallback(
    (time: string) => {
      setIsAutoTime(false);
      setSelectedTime(time);
      updateUrlParams(selectedDay, time, selectedCiclo, false);
    },
    [selectedDay, selectedCiclo, updateUrlParams]
  );

  const handleCicloChange = useCallback(
    (ciclo: PartOfTerm | "all") => {
      setSelectedCiclo(ciclo);
      if (!isAutoTime) {
        updateUrlParams(selectedDay, selectedTime, ciclo, false);
      }
    },
    [isAutoTime, selectedDay, selectedTime, updateUrlParams]
  );

  const handleGoToNow = useCallback(() => {
    const now = getCurrentTime();
    const today = getCurrentDayCode();
    setIsAutoTime(true);
    setSelectedDay(today);
    setSelectedTime(now);
    updateUrlParams(today, now, selectedCiclo, true);
  }, [selectedCiclo, updateUrlParams]);

  /**
   * Build query string to append to navigation links
   * so that manual time overrides are preserved across pages.
   */
  const buildLinkQuery = useCallback((): string => {
    if (isAutoTime) return "";
    const params = new URLSearchParams();
    params.set("day", selectedDay);
    params.set("time", selectedTime);
    if (selectedCiclo !== getCurrentCiclo(manifestData.term, ciclosData)) {
      params.set("ciclo", selectedCiclo);
    }
    return `?${params.toString()}`;
  }, [isAutoTime, selectedDay, selectedTime, selectedCiclo]);

  return {
    selectedDay,
    selectedTime,
    selectedCiclo,
    isAutoTime,
    handleDayChange,
    handleTimeChange,
    handleCicloChange,
    handleGoToNow,
    buildLinkQuery,
  };
}
