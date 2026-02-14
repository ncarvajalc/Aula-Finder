import { describe, it, expect } from "vitest";
import { getClosureStatus } from "@/lib/closures";

describe("getClosureStatus", () => {
  // Operating hours tests
  it("should report closed on Sunday", () => {
    const status = getClosureStatus("D", "12:00", "2026-02-15");
    expect(status.isClosed).toBe(true);
    expect(status.reason).toContain("Domingos");
  });

  it("should report closed on weekdays before 5:30 AM", () => {
    const status = getClosureStatus("L", "05:00", "2026-02-16");
    expect(status.isClosed).toBe(true);
  });

  it("should report closed on weekdays after 10:00 PM", () => {
    const status = getClosureStatus("L", "22:30", "2026-02-16");
    expect(status.isClosed).toBe(true);
  });

  it("should report open on weekdays during operating hours", () => {
    const status = getClosureStatus("L", "10:00", "2026-02-16");
    expect(status.isClosed).toBe(false);
  });

  it("should report closed on Saturday before 6:00 AM", () => {
    const status = getClosureStatus("S", "05:30", "2026-02-14");
    expect(status.isClosed).toBe(true);
  });

  it("should report closed on Saturday after 6:00 PM", () => {
    const status = getClosureStatus("S", "18:30", "2026-02-14");
    expect(status.isClosed).toBe(true);
  });

  it("should report open on Saturday during operating hours", () => {
    const status = getClosureStatus("S", "12:00", "2026-02-14");
    expect(status.isClosed).toBe(false);
  });

  // Holiday tests
  it("should report closed on New Year's Day", () => {
    const status = getClosureStatus("J", "10:00", "2026-01-01");
    expect(status.isClosed).toBe(true);
    expect(status.reason).toContain("Año Nuevo");
  });

  it("should report closed on Colombian holidays", () => {
    const status = getClosureStatus("L", "10:00", "2026-03-23");
    expect(status.isClosed).toBe(true);
    expect(status.reason).toContain("San José");
  });

  // Special events
  it("should report closed during MoneyCon", () => {
    const status = getClosureStatus("S", "12:00", "2026-01-17");
    expect(status.isClosed).toBe(true);
    expect(status.reason).toContain("MoneyCon");
  });

  it("should report open on a normal weekday", () => {
    const status = getClosureStatus("M", "10:00", "2026-02-17");
    expect(status.isClosed).toBe(false);
  });
});
