export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  /** Lunar-calendar holiday (e.g. Ramazan/Kurban Bayramı) whose exact date
   * isn't officially confirmed yet and may still shift by a day. */
  isTentative: boolean;
}

export interface OffBlock {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  days: string[]; // YYYY-MM-DD, inclusive
  containsHoliday: boolean;
  holidayNames: string[];
  containsTentativeHoliday: boolean;
}

export interface BridgeOpportunity {
  /** Leave days you need to request (workdays), YYYY-MM-DD */
  leaveDates: string[];
  /** Full contiguous time-off range produced once leaveDates are taken */
  resultStart: string;
  resultEnd: string;
  resultDays: string[];
  /** resultDays.length / leaveDates.length — higher is a better deal */
  efficiency: number;
  relatedHolidays: string[];
  /** True if any related holiday's date isn't officially confirmed yet. */
  relatedHolidaysTentative: boolean;
}
