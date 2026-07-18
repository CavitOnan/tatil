import type { BridgeOpportunity, OffBlock, PublicHoliday } from "../types";

const toISO = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

/**
 * Walks day-by-day from `start` to `end` and groups consecutive
 * weekend/holiday days into blocks. Workdays between two blocks are the
 * "bridge" candidates: request that many leave days to merge the blocks.
 */
export function buildOffBlocks(
  start: Date,
  end: Date,
  holidays: PublicHoliday[]
): OffBlock[] {
  const holidayByDate = new Map<string, string[]>();
  for (const h of holidays) {
    const list = holidayByDate.get(h.date) ?? [];
    list.push(h.localName);
    holidayByDate.set(h.date, list);
  }

  const blocks: OffBlock[] = [];
  let current: OffBlock | null = null;

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const iso = toISO(d);
    const holidayNames = holidayByDate.get(iso);
    const isOff = isWeekend(d) || !!holidayNames;

    if (isOff) {
      if (!current) {
        current = {
          start: iso,
          end: iso,
          days: [iso],
          containsHoliday: !!holidayNames,
          holidayNames: holidayNames ? [...holidayNames] : [],
        };
      } else {
        current.end = iso;
        current.days.push(iso);
        if (holidayNames) {
          current.containsHoliday = true;
          current.holidayNames.push(...holidayNames);
        }
      }
    } else if (current) {
      blocks.push(current);
      current = null;
    }
  }
  if (current) blocks.push(current);

  return blocks;
}

/**
 * Finds the workday gaps between off-blocks and ranks them by how many
 * vacation days each leave day "buys" (resultDays.length / leaveDates.length).
 * Only gaps up to `maxLeaveDays` are considered worth suggesting.
 */
export function findBridgeOpportunities(
  start: Date,
  end: Date,
  holidays: PublicHoliday[],
  maxLeaveDays = 4
): BridgeOpportunity[] {
  // Look a bit further out so a block right at `end` can still bridge forward.
  const blocks = buildOffBlocks(start, addDays(end, maxLeaveDays), holidays);
  const opportunities: BridgeOpportunity[] = [];

  for (let i = 0; i < blocks.length - 1; i++) {
    const current = blocks[i];
    const next = blocks[i + 1];

    const gapStart = addDays(new Date(current.end), 1);
    const gapEnd = addDays(new Date(next.start), -1);
    const gapDays: string[] = [];
    for (let d = gapStart; d <= gapEnd; d = addDays(d, 1)) {
      gapDays.push(toISO(d));
    }

    if (gapDays.length === 0 || gapDays.length > maxLeaveDays) continue;
    if (new Date(current.end) > end) continue; // don't surface bridges fully past the requested window

    const resultDays = [...current.days, ...gapDays, ...next.days];
    opportunities.push({
      leaveDates: gapDays,
      resultStart: current.start,
      resultEnd: next.end,
      resultDays,
      efficiency: resultDays.length / gapDays.length,
      relatedHolidays: [...current.holidayNames, ...next.holidayNames],
    });
  }

  return opportunities.sort((a, b) => b.efficiency - a.efficiency);
}
