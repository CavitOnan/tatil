import type { PublicHoliday } from "../types";

const NAGER_BASE_URL = "https://date.nager.at/api/v3";

/** Nager.Date appends this to lunar-calendar holidays (Ramazan/Kurban
 * Bayramı) whose date depends on an official moon-sighting announcement
 * that hasn't happened yet, so the date may still shift by a day. */
const TENTATIVE_SUFFIX = /\s*\(Tentative Date\)$/;

function normalizeHoliday(raw: PublicHoliday): PublicHoliday {
  const isTentative = TENTATIVE_SUFFIX.test(raw.localName);
  return {
    ...raw,
    localName: raw.localName.replace(TENTATIVE_SUFFIX, ""),
    name: raw.name.replace(TENTATIVE_SUFFIX, ""),
    isTentative,
  };
}

/**
 * Nager.Date only returns holidays one calendar year at a time, so a
 * "1 year ahead" view spans two calls when the range crosses Dec 31.
 */
export async function fetchPublicHolidays(
  countryCode: string,
  year: number
): Promise<PublicHoliday[]> {
  const response = await fetch(
    `${NAGER_BASE_URL}/PublicHolidays/${year}/${countryCode}`
  );
  if (!response.ok) {
    throw new Error(`Tatil verisi alınamadı: ${response.status}`);
  }
  const data: PublicHoliday[] = await response.json();
  return data.map(normalizeHoliday);
}

export async function fetchHolidaysForNextYear(
  countryCode: string,
  fromDate: Date = new Date()
): Promise<PublicHoliday[]> {
  const currentYear = fromDate.getFullYear();
  const [thisYear, nextYear] = await Promise.all([
    fetchPublicHolidays(countryCode, currentYear),
    fetchPublicHolidays(countryCode, currentYear + 1),
  ]);

  const fromStr = fromDate.toISOString().slice(0, 10);
  const oneYearAhead = new Date(fromDate);
  oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
  const toStr = oneYearAhead.toISOString().slice(0, 10);

  return [...thisYear, ...nextYear]
    .filter((h) => h.date >= fromStr && h.date <= toStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}
