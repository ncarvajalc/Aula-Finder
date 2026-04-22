export function withConfigParam(query: string): string {
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  params.set("config", "1");
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}
