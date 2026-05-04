export type CountryFilter =
  | "all"
  | "Ukraine"
  | "Israel"
  | "Palestine"
  | "Syria"
  | "Yemen"
  | "Sudan"
  | "Myanmar"
  | "DR Congo"
  | "Ethiopia"
  | "Somalia";

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
