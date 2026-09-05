/**
 * Purchases — StoreKit 2 on iOS, Google Play Billing on Android.
 *
 * Three rules, in order of how much they matter:
 *
 *  1. **The client is never the source of truth.** A purchase result unlocks the
 *     UI optimistically, but entitlement is whatever `subscriptions` says, and
 *     that row is written by a server webhook the client cannot reach. Trusting
 *     the client here is how apps get pirated in an afternoon.
 *  2. **Safety is never behind it.** Nothing under Get home safe reads
 *     entitlement, and there is a test for that.
 *  3. **Never during a live night.** Enforced in the paywall screen itself, not
 *     remembered by each caller.
 *
 * The implementation is behind an interface because the store SDK is the single
 * most likely thing in this app to be swapped (RevenueCat, direct StoreKit 2,
 * or Expo's own module), and none of the calling code should care.
 */
import { optional, capabilities } from './optional';
import { getClient } from '@/data/remote';
import type { MessageKey } from '@/i18n';

export type ProductId = 'plus.monthly' | 'plus.annual' | 'plus.lifetime' | 'crew.pass';

export interface Product {
  id: ProductId;
  /**
   * The store's own localised title, when the store answered. `titleKey` is the
   * fallback used when it did not — a catalogue key rather than a string, so
   * the offline path is not the one place the app reverts to English.
   */
  title?: string;
  titleKey?: MessageKey;
  priceLabel: string;
  period: 'month' | 'year' | 'lifetime';
  note?: string;
  noteKey?: MessageKey;
}

export interface Entitlement {
  active: boolean;
  productId: ProductId | null;
  /** null for lifetime. */
  renewsAt: number | null;
  source: 'server' | 'client' | 'none';
}

export const NO_ENTITLEMENT: Entitlement = { active: false, productId: null, renewsAt: null, source: 'none' };

/** Shown when the store is unreachable, so the paywall is never a blank screen. */
export const FALLBACK_PRODUCTS: Product[] = [
  // `titleKey` rather than a title: the real store returns localised titles, so
  // this fallback is the only path that would otherwise show English to a
  // French user, and it is the path that runs when the store is unreachable.
  { id: 'plus.monthly', titleKey: 'billing.productMonthly', priceLabel: '€4.99', period: 'month' },
  { id: 'plus.annual', titleKey: 'billing.productAnnual', priceLabel: '€34.99', period: 'year', noteKey: 'billing.productSave' },
  { id: 'plus.lifetime', titleKey: 'billing.productLifetime', priceLabel: '€79.99', period: 'lifetime' },
];

function sdk() {
  if (!capabilities().purchases) return null;
  return optional(() => require('react-native-purchases').default);
}

export const purchasesAvailable = () => sdk() !== null;

export async function configure(userId: string | null): Promise<boolean> {
  const Purchases = sdk();
  const key = process.env.EXPO_PUBLIC_RC_KEY;
  if (!Purchases || !key) return false;
  try {
    await Purchases.configure({ apiKey: key, appUserID: userId });
    return true;
  } catch {
    return false;
  }
}

export async function loadProducts(): Promise<Product[]> {
  const Purchases = sdk();
  if (!Purchases) return FALLBACK_PRODUCTS;
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings?.current?.availablePackages ?? [];
    if (packages.length === 0) return FALLBACK_PRODUCTS;
    return packages.map((p: any) => ({
      id: p.product.identifier as ProductId,
      title: p.product.title ?? p.identifier,
      // Always the STORE's localised price string. Formatting a price ourselves
      // is how you show € to someone being charged in lei.
      priceLabel: p.product.priceString,
      period: p.packageType === 'ANNUAL' ? 'year' : p.packageType === 'LIFETIME' ? 'lifetime' : 'month',
    }));
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function purchase(productId: ProductId): Promise<Entitlement> {
  const Purchases = sdk();
  if (!Purchases) return NO_ENTITLEMENT;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings?.current?.availablePackages?.find(
      (p: any) => p.product.identifier === productId
    );
    if (!pkg) return NO_ENTITLEMENT;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    // Optimistic: the UI unlocks now, but the webhook is what makes it true.
    // A client that lies here gains 90 seconds of Insights and nothing else.
    void mirrorToServer();
    return fromCustomerInfo(customerInfo);
  } catch (err: any) {
    if (err?.userCancelled) return NO_ENTITLEMENT;
    throw err;
  }
}

export async function restore(): Promise<Entitlement> {
  const Purchases = sdk();
  if (!Purchases) return NO_ENTITLEMENT;
  try {
    const customerInfo = await Purchases.restorePurchases();
    void mirrorToServer();
    return fromCustomerInfo(customerInfo);
  } catch {
    return NO_ENTITLEMENT;
  }
}

function fromCustomerInfo(info: any): Entitlement {
  const ent = info?.entitlements?.active?.plus;
  if (!ent) return NO_ENTITLEMENT;
  return {
    active: true,
    productId: ent.productIdentifier as ProductId,
    renewsAt: ent.expirationDate ? new Date(ent.expirationDate).getTime() : null,
    source: 'client',
  };
}

/**
 * The authority. Reads the `subscriptions` row a webhook wrote, and that row is
 * the only thing that can turn a paid feature on for real.
 */
export async function serverEntitlement(): Promise<Entitlement> {
  const supabase = getClient();
  if (!supabase) return NO_ENTITLEMENT;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('product_id,status,current_period_end')
    .maybeSingle();
  if (error || !data) return NO_ENTITLEMENT;
  const active = data.status === 'active' || data.status === 'grace';
  return {
    active,
    productId: (data.product_id as ProductId) ?? null,
    renewsAt: data.current_period_end ? new Date(data.current_period_end).getTime() : null,
    source: 'server',
  };
}

/** Nudges the server to re-read the store immediately rather than on its own schedule. */
async function mirrorToServer(): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;
  await supabase.functions.invoke('sync-entitlement').catch(() => {});
}
