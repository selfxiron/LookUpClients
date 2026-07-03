/** Skip obvious placeholder/test entries in OSM and Geoapify data */
export function isJunkPlaceName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (normalized.length < 2) return true;

  const junkPatterns = [
    /^(cafe|café|restaurant|shop|store|hotel|clinic|school|salon|gym)\s*\d+$/,
    /^(cafe|restaurant|shop|store|hotel)\s*(one|two|three|1|2|3)$/,
    /^(untitled|unknown|test|sample|demo|placeholder|new cafe|new restaurant)$/,
    /^test\s/,
    /^\d+$/,
  ];

  return junkPatterns.some((pattern) => pattern.test(normalized));
}
