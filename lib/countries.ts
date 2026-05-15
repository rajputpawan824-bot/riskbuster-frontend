/**
 * Country filter id: either "all" or a country label (string).
 * Was previously a strict union, but countries are now dynamic (CRUD via API).
 */
export type CountryFilter = "all" | (string & {});

export const COUNTRY_ITEMS: { id: CountryFilter; label: string; flag: string }[] = [
  { id: "all", label: "All Countries", flag: "🌐" },
  { id: "Ukraine", label: "Ukraine", flag: "🇺🇦" },
  { id: "Israel", label: "Israel", flag: "🇮🇱" },
  { id: "Palestine", label: "Palestine", flag: "🇵🇸" },
  { id: "Syria", label: "Syria", flag: "🇸🇾" },
  { id: "Yemen", label: "Yemen", flag: "🇾🇪" },
  { id: "Sudan", label: "Sudan", flag: "🇸🇩" },
  { id: "Myanmar", label: "Myanmar", flag: "🇲🇲" },
  { id: "DR Congo", label: "DR Congo", flag: "🇨🇩" },
  { id: "Ethiopia", label: "Ethiopia", flag: "🇪🇹" },
  { id: "Somalia", label: "Somalia", flag: "🇸🇴" },
];

const labels = COUNTRY_ITEMS.filter((c) => c.id !== "all").map((c) => c.label);

export const COUNTRY_FORM_OPTIONS = [
  "Israel / Palestine",
  ...labels.filter((l) => l !== "Israel" && l !== "Palestine"),
];

/** Flat list used in the country Region dropdown and conflict Region filter. */
export const WORLD_REGIONS = [
  "Africa",
  "Northern Africa",
  "Western Africa",
  "Middle Africa",
  "Eastern Africa",
  "Southern Africa",
  "Asia",
  "Central Asia",
  "Eastern Asia",
  "South-Eastern Asia",
  "Southern Asia",
  "Western Asia",
  "Europe",
  "Northern Europe",
  "Western Europe",
  "Eastern Europe",
  "Southern Europe",
  "North America",
  "Northern America",
  "Central America",
  "Caribbean",
  "South America",
  "Andean States",
  "Southern Cone",
  "Brazil Region",
  "Guianas",
  "Oceania",
  "Australia and New Zealand",
  "Melanesia",
  "Micronesia",
  "Polynesia",
  "Antarctica",
] as const;

export type WorldRegion = (typeof WORLD_REGIONS)[number];
