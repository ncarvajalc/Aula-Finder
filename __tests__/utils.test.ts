import { describe, it, expect } from "vitest";
import { getAssetPath, BASE_PATH } from "@/lib/utils";

describe("getAssetPath", () => {
  it("should prepend basePath to absolute paths", () => {
    expect(getAssetPath("/images/buildings/default.jpg")).toBe(
      "/Aula-Finder/images/buildings/default.jpg"
    );
  });

  it("should not double-prepend basePath", () => {
    expect(getAssetPath("/Aula-Finder/images/buildings/default.jpg")).toBe(
      "/Aula-Finder/images/buildings/default.jpg"
    );
  });

  it("should not modify external URLs", () => {
    expect(getAssetPath("https://example.com/image.jpg")).toBe(
      "https://example.com/image.jpg"
    );
  });

  it("should handle empty string", () => {
    expect(getAssetPath("")).toBe("");
  });

  it("should export BASE_PATH constant", () => {
    expect(BASE_PATH).toBe("/Aula-Finder");
  });
});
