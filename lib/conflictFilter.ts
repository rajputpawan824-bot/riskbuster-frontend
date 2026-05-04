import type { CountryFilter } from "./countries";
import type { Conflict } from "@/types/models";

export function filterByCountry(list: Conflict[], country: CountryFilter): Conflict[] {
  if (country === "all") return list;
  const f = country.toLowerCase();
  return list.filter((c) => {
    const loc = c.country.toLowerCase();
    if (f === "israel" || f === "palestine") {
      return loc.includes("israel") || loc.includes("palestine");
    }
    return loc.includes(f);
  });
}

export function sortConflicts(
  list: Conflict[],
  order: "latest" | "oldest"
): Conflict[] {
  const out = [...list];
  out.sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    return order === "latest" ? tb - ta : ta - tb;
  });
  return out;
}

export function topN(list: Conflict[], n: number) {
  return list.slice(0, n);
}
