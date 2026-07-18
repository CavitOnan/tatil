export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
}

export interface OffBlock {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  days: string[]; // YYYY-MM-DD, inclusive
  containsHoliday: boolean;
  holidayNames: string[];
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
}

export type SubscriptionTier = "free" | "monthly" | "yearly";
