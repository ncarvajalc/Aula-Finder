import { describe, it, expect } from "vitest";
import metadata from "@/data/buildings-metadata.json";

const expectedMainBuildingCoordinates: Record<
  string,
  { latitude: number; longitude: number }
> = {
  ML: { latitude: 4.60279, longitude: -74.06485 },
  SD: { latitude: 4.60453, longitude: -74.06593 },
  RGD: { latitude: 4.60233, longitude: -74.06588 },
  AU: { latitude: 4.60273, longitude: -74.06649 },
  O: { latitude: 4.60076, longitude: -74.06493 },
  B: { latitude: 4.60142, longitude: -74.0657 },
  W: { latitude: 4.60224, longitude: -74.06503 },
  LL: { latitude: 4.60213, longitude: -74.06525 },
  C: { latitude: 4.60125, longitude: -74.06516 },
  R: { latitude: 4.60153, longitude: -74.06399 },
  TX: { latitude: 4.60124, longitude: -74.06389 },
  S1: { latitude: 4.60185, longitude: -74.06424 },
  Q: { latitude: 4.60026, longitude: -74.06515 },
  Z: { latitude: 4.60234, longitude: -74.06559 },
  Y: { latitude: 4.60231, longitude: -74.06529 },
  GA: { latitude: 4.6003, longitude: -74.06292 },
};

describe("buildings metadata main coordinates", () => {
  it("should keep corrected GPS coordinates for all main buildings", () => {
    const byCode = new Map(metadata.buildings.map((building) => [building.code, building]));

    for (const [code, expected] of Object.entries(expectedMainBuildingCoordinates)) {
      const building = byCode.get(code);
      expect(building, `Missing building ${code}`).toBeDefined();
      expect(building?.coordinates?.latitude).toBeCloseTo(expected.latitude, 5);
      expect(building?.coordinates?.longitude).toBeCloseTo(expected.longitude, 5);
    }
  });
});
