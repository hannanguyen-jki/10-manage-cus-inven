/**
 * Utility functions for calculating customer order inactivity & recency
 * Supports both MM/DD/YYYY, M/D/YYYY, and ISO date strings.
 */

export type InactivityTier = "ACTIVE" | "AT_RISK" | "INACTIVE" | "NO_ORDER";

export interface InactivityDetails {
  tier: InactivityTier;
  days: number | null;
  months: number | null;
  years: number | null;
  dateStr: string | null;
  label: string; // e.g. "14d ago", "85d ago", "9.2m ago"
  fullLabel: string; // e.g. "Ordered 14 days ago", "85 days without order (2.8 mos)"
  badgeTone: "emerald" | "amber" | "rose" | "gray";
  statusText: string; // "Active", "At Risk", "Inactive", "No Orders"
  alertMessage: string;
}

/**
 * Parses a date string like "10/14/2026", "2026-10-14T00:00:00.000Z", etc.
 */
export function parseDateSafe(val: string | Date | null | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  const s = String(val).trim();
  if (!s) return null;

  // Handle MM/DD/YYYY or M/D/YYYY
  const slashParts = s.split(/[\/\-]/);
  if (slashParts.length === 3 && slashParts[2].length === 4) {
    const m = parseInt(slashParts[0], 10) - 1;
    const d = parseInt(slashParts[1], 10);
    const y = parseInt(slashParts[2], 10);
    if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) return dt;
    }
  }

  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Calculates inactivity details relative to current date (or specified reference date).
 */
export function getInactivityDetails(
  dateInput: string | Date | null | undefined,
  referenceDate: Date = new Date()
): InactivityDetails {
  const d = parseDateSafe(dateInput);

  if (!d) {
    return {
      tier: "NO_ORDER",
      days: null,
      months: null,
      years: null,
      dateStr: null,
      label: "No orders",
      fullLabel: "No order history recorded",
      badgeTone: "gray",
      statusText: "No Orders",
      alertMessage: "Customer has never placed an order or record is missing.",
    };
  }

  const diffMs = referenceDate.getTime() - d.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffMonths = parseFloat((diffDays / 30.4375).toFixed(1));
  const diffYears = parseFloat((diffDays / 365.25).toFixed(1));

  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // TIER 1: ACTIVE / green (bought within the last 3 months, <= 90 days)
  if (diffDays <= 90) {
    const label = diffDays === 0 ? "Today" : `${diffDays}d ago`;
    return {
      tier: "ACTIVE",
      days: diffDays,
      months: diffMonths,
      years: diffYears,
      dateStr,
      label,
      fullLabel: diffDays === 0 ? "Ordered today" : `Ordered ${diffDays} days ago`,
      badgeTone: "emerald",
      statusText: "Active",
      alertMessage: "Active customer in good standing. Recent purchase completed.",
    };
  }

  // TIER 2: AT RISK / yellow (91 - 180 days: 3 to 6 months)
  if (diffDays <= 180) {
    const label = `${diffDays}d ago (~${diffMonths}m)`;
    return {
      tier: "AT_RISK",
      days: diffDays,
      months: diffMonths,
      years: diffYears,
      dateStr,
      label,
      fullLabel: `${diffDays} days without order (~${diffMonths} months)`,
      badgeTone: "amber",
      statusText: "At Risk",
      alertMessage: `⚠️ Customer has not ordered for ${diffDays} days (~${diffMonths} months). Proactive follow-up or check-in recommended.`,
    };
  }

  // TIER 3: INACTIVE / red (> 180 days: more than 6 months without a purchase)
  const timeDesc = diffYears >= 1 ? `${diffYears}y` : `${diffMonths}m`;
  return {
    tier: "INACTIVE",
    days: diffDays,
    months: diffMonths,
    years: diffYears,
    dateStr,
    label: `${diffDays}d ago (${timeDesc})`,
    fullLabel: `${diffDays} days without order (${diffMonths} months ago)`,
    badgeTone: "rose",
    statusText: "Inactive",
    alertMessage: `🚨 High inactivity: No orders for ${diffDays} days (${diffMonths} months). Re-engagement or win-back quote needed immediately!`,
  };
}

export type RecencyStatus = "ACTIVE" | "AT_RISK" | "INACTIVE";

/**
 * Customer bucket from the last purchase date, always computed from today's date:
 *   ACTIVE   = bought within 3 months (green)
 *   AT_RISK  = last bought 3-6 months ago (yellow)
 *   INACTIVE = more than 6 months ago, or no purchase on record (red)
 */
export function recencyStatus(
  dateInput: string | Date | null | undefined,
  referenceDate: Date = new Date()
): RecencyStatus {
  const tier = getInactivityDetails(dateInput, referenceDate).tier;
  return tier === "ACTIVE" ? "ACTIVE" : tier === "AT_RISK" ? "AT_RISK" : "INACTIVE";
}
