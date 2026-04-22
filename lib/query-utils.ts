/**
 * Ensures the query string includes `config=1`, preserving existing parameters.
 * Accepts query strings with or without a leading `?` and returns a normalized query string.
 */
export function withConfigParam(query: string): string {
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  params.set("config", "1");
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}
