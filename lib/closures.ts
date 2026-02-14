/**
 * University closure logic: operating hours, holidays, and special events.
 * Used to determine if the campus or specific buildings/rooms are closed.
 */

import closuresData from "@/data/university-closures.json";
import { DayOfWeek } from "@/types";

export interface ClosureStatus {
  isClosed: boolean;
  reason?: string;
}

/**
 * Check if the university is closed at a given day and time.
 * Checks operating hours, holidays, and special events.
 *
 * @param day Day of the week code (L, M, I, J, V, S, D)
 * @param time Time in HH:MM format
 * @param date Optional ISO date string (YYYY-MM-DD) for holiday/event checks.
 *             Defaults to today.
 * @param building Optional building code for building-specific closures
 * @param room Optional room code for room-specific closures
 */
export function getClosureStatus(
  day: DayOfWeek,
  time: string,
  date?: string,
  building?: string,
  room?: string
): ClosureStatus {
  // 1. Check operating hours
  const hoursStatus = checkOperatingHours(day, time);
  if (hoursStatus.isClosed) return hoursStatus;

  // 2. Check holidays and special events (only if we have a date)
  const checkDate = date || new Date().toISOString().slice(0, 10);

  const holidayStatus = checkHoliday(checkDate);
  if (holidayStatus.isClosed) return holidayStatus;

  const eventStatus = checkSpecialEvent(checkDate, building, room);
  if (eventStatus.isClosed) return eventStatus;

  return { isClosed: false };
}

function checkOperatingHours(day: DayOfWeek, time: string): ClosureStatus {
  const { operatingHours } = closuresData;

  if (day === "D") {
    return {
      isClosed: true,
      reason: operatingHours.sunday.comment,
    };
  }

  if (day === "S") {
    const { openTime, closeTime } = operatingHours.saturday;
    if (openTime && closeTime && (time < openTime || time >= closeTime)) {
      return {
        isClosed: true,
        reason: operatingHours.saturday.comment,
      };
    }
    return { isClosed: false };
  }

  // Weekday (L, M, I, J, V)
  const { openTime, closeTime } = operatingHours.weekdays;
  if (time < openTime || time >= closeTime) {
    return {
      isClosed: true,
      reason: operatingHours.weekdays.comment,
    };
  }

  return { isClosed: false };
}

function checkHoliday(dateStr: string): ClosureStatus {
  const year = dateStr.slice(0, 4);
  const holidays =
    closuresData.holidays[year as keyof typeof closuresData.holidays];

  if (!holidays || !Array.isArray(holidays)) return { isClosed: false };

  const holiday = holidays.find(
    (h: { date: string }) => h.date === dateStr
  );
  if (holiday) {
    return {
      isClosed: true,
      reason: `${holiday.name} — ${holiday.comment}`,
    };
  }

  return { isClosed: false };
}

function checkSpecialEvent(
  dateStr: string,
  building?: string,
  room?: string
): ClosureStatus {
  const { events } = closuresData.specialEvents;

  for (const event of events) {
    if (dateStr >= event.startDate && dateStr <= event.endDate) {
      // Check scope
      if (event.scope === "campus") {
        return { isClosed: true, reason: event.comment };
      }
      if (
        event.scope === "building" &&
        building &&
        "buildings" in event &&
        Array.isArray((event as Record<string, unknown>).buildings) &&
        ((event as Record<string, unknown>).buildings as string[]).includes(
          building
        )
      ) {
        return { isClosed: true, reason: event.comment };
      }
      if (
        event.scope === "room" &&
        room &&
        "rooms" in event &&
        Array.isArray((event as Record<string, unknown>).rooms) &&
        ((event as Record<string, unknown>).rooms as string[]).includes(room)
      ) {
        return { isClosed: true, reason: event.comment };
      }
    }
  }

  return { isClosed: false };
}
