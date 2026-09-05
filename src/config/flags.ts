/**
 * Build flags.
 *
 * One constant per decision, all of them in this file, so "is this on?" is
 * answered by reading one screen of code rather than by grepping.
 */

/**
 * Whether billing is part of the product yet.
 *
 * OFF. Nothing that mentions a price, a tier name or a purchase is reachable
 * while this is false — not in Settings, not as an upsell, not as a route you
 * can deep-link to. The screens, the products list, the store adapter, the
 * `subscriptions` table and its RLS all remain, unchanged and untouched, so
 * turning this back on is one boolean rather than rebuilding an interface.
 *
 * Two consequences that are easy to get wrong and are therefore enforced:
 *
 *  · Anything previously gated on entitlement behaves as UNLOCKED. A feature
 *    that is invisible to buy and also locked is simply a broken feature.
 *    `store.plus` is hard true while this is false.
 *  · The client still gets no insert or update policy on `subscriptions`.
 *    Hiding the interface changes nothing about who is allowed to grant an
 *    entitlement, which is the server and only the server.
 *
 * `src/__tests__/policy.test.ts` asserts both, plus that no price, tier name or
 * paywall route survives anywhere a user can reach.
 */
export const BILLING_VISIBLE = false;
