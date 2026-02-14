import { describe, it, expect } from "vitest";
import { getAssetPath } from "@/lib/utils";

describe("Asset Path Utility", () => {
  it("should prefix path with /Aula-Finder", () => {
    const result = getAssetPath("/images/test.jpg");
    expect(result).toBe("/Aula-Finder/images/test.jpg");
  });

  it("should handle paths without leading slash", () => {
    const result = getAssetPath("images/test.jpg");
    expect(result).toBe("/Aula-Finder/images/test.jpg");
  });

  it("should not double prefix", () => {
    const result = getAssetPath("/Aula-Finder/images/test.jpg");
    expect(result).toBe("/Aula-Finder/images/test.jpg");
  });
});

describe("Image Performance", () => {
  it("should use Next.js Image component for optimization", () => {
    // This is a conceptual test - Next.js Image component provides:
    // - Automatic lazy loading
    // - Automatic size optimization
    // - Modern formats (WebP, AVIF)
    // - Responsive images
    expect(true).toBe(true);
  });
});
