/**
 * Feature flags for the UI.
 *
 * SHOW_PAYMENTS: the Payments page is temporarily hidden (2026-11-17, owner request).
 * The /payments route, API and data are untouched; set this to `true` to bring back
 * the menu item and the dashboard shortcuts.
 */
export const SHOW_PAYMENTS = false;

/** Show payment cells and mobile badges in the customer list. Data stays intact. */
export const SHOW_CUSTOMER_PAYMENT = false;
