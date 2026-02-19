import { Platform } from "react-native";
import type {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

/** Returns true if the environment has a RevenueCat key for the current platform. */
export function isRevenueCatAvailable(): boolean {
  const key = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  return key.length > 0;
}

function getSDK() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rc = require("react-native-purchases");
    return rc.default ?? rc;
  } catch {
    return null;
  }
}

/**
 * Configure the RevenueCat SDK with the platform API key.
 * Call once at app startup (app/_layout.tsx) after fonts load.
 * No-op if no API key is configured (Expo Go, CI, tests).
 */
export function initRevenueCat(): void {
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn("[revenueCat] No API key — RevenueCat disabled");
    return;
  }
  const Purchases = getSDK();
  if (!Purchases) {
    console.warn("[revenueCat] react-native-purchases not available");
    return;
  }
  Purchases.configure({ apiKey });
}

/**
 * Returns the current CustomerInfo, or null if RevenueCat is unavailable.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const Purchases = getSDK();
  if (!Purchases || !isRevenueCatAvailable()) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.warn("[revenueCat] getCustomerInfo failed:", e);
    return null;
  }
}

/**
 * Returns the current Offerings (packages for the paywall).
 * Returns null if RevenueCat is unavailable.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  const Purchases = getSDK();
  if (!Purchases || !isRevenueCatAvailable()) return null;
  try {
    return await Purchases.getOfferings();
  } catch (e) {
    console.warn("[revenueCat] getOfferings failed:", e);
    return null;
  }
}

/**
 * Initiates the purchase flow for the given package.
 * Returns updated CustomerInfo on success, or throws on user cancellation / error.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const Purchases = getSDK();
  if (!Purchases) throw new Error("RevenueCat SDK not available");
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

/**
 * Restores prior purchases. Returns updated CustomerInfo.
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  const Purchases = getSDK();
  if (!Purchases || !isRevenueCatAvailable()) return null;
  try {
    return await Purchases.restorePurchases();
  } catch (e) {
    console.warn("[revenueCat] restorePurchases failed:", e);
    return null;
  }
}

/**
 * Links a Supabase user ID to RevenueCat so purchase history survives sign-outs.
 * Call on successful sign-in.
 */
export async function logInRevenueCat(userId: string): Promise<void> {
  const Purchases = getSDK();
  if (!Purchases || !isRevenueCatAvailable()) return;
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    console.warn("[revenueCat] logIn failed:", e);
  }
}

/**
 * Resets the RevenueCat identity to anonymous.
 * Call on sign-out.
 */
export async function logOutRevenueCat(): Promise<void> {
  const Purchases = getSDK();
  if (!Purchases || !isRevenueCatAvailable()) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    console.warn("[revenueCat] logOut failed:", e);
  }
}

/**
 * Returns true if the given CustomerInfo has an active `pro_access` entitlement.
 */
export function isProEntitlement(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;
  return customerInfo.entitlements.active["pro_access"] !== undefined;
}
