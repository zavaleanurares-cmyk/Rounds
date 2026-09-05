import React from 'react';
import { Redirect } from 'expo-router';
import { BILLING_VISIBLE } from '@/config/flags';
import { Paywall } from '@/features/billing/Paywall';

/**
 * S-14 · Paywall.
 *
 * The screen itself lives in `src/features/billing/`. This file is the route,
 * and its only job while billing is hidden is to make sure the route does not
 * exist in any meaningful sense: a deep link, a stale notification or a typed
 * URL lands on Tonight, not on a price.
 *
 * The redirect is here rather than inside the screen so that the screen's own
 * code is never mounted, never fires `paywall_shown`, and never loads products.
 */
export default function PaywallRoute() {
  if (!BILLING_VISIBLE) return <Redirect href="/(tabs)/tonight" />;
  return <Paywall />;
}
