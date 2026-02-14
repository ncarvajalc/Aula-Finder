import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Base path for the application when deployed to GitHub Pages.
 * Must match the basePath in next.config.mjs.
 */
export const BASE_PATH = "/Aula-Finder";

/**
 * Prepend the basePath to a local asset path (e.g. images).
 * Needed because next/image with unoptimized:true does not
 * automatically prepend basePath in static exports.
 */
export function getAssetPath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http") || path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}
