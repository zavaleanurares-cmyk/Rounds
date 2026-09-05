import React from 'react';
import { Redirect } from 'expo-router';
import { BILLING_VISIBLE } from '@/config/flags';
import { Subscription } from '@/features/billing/Subscription';

/**
 * S-08 · Subscription.
 *
 * Route only. While billing is hidden there is no row in Settings that reaches
 * here, and reaching it any other way redirects rather than showing a tier.
 */
export default function SubscriptionRoute() {
  if (!BILLING_VISIBLE) return <Redirect href="/(tabs)/tonight" />;
  return <Subscription />;
}
