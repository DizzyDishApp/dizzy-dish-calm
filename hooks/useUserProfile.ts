import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserProfile, fetchSubscription, updateUserProStatus } from "@/lib/api";
import {
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  isProEntitlement,
} from "@/lib/revenueCat";
import { queryKeys } from "@/lib/queryKeys";
import type { User, SubscriptionPlan } from "@/types";
import type { PurchasesPackage } from "react-native-purchases";

/**
 * Query hook for fetching the user profile from Supabase.
 * User.isPro is the authoritative Pro status — sourced from profiles.is_pro,
 * which is kept in sync with RevenueCat via updateUserProStatus.
 */
export function useUserProfile() {
  return useQuery<User, Error>({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchUserProfile,
  });
}

/**
 * Query hook for fetching subscription data.
 */
export function useSubscription() {
  return useQuery<SubscriptionPlan, Error>({
    queryKey: queryKeys.user.subscription(),
    queryFn: fetchSubscription,
  });
}

/**
 * Queries RevenueCat for current entitlement + available packages.
 * Exposes purchase and restore mutations that update Supabase on success.
 *
 * isPro here reflects the live RevenueCat entitlement — use User.isPro from
 * useUserProfile() as the authoritative value for feature gating.
 */
export function useRevenueCatInfo() {
  const queryClient = useQueryClient();

  const customerInfoQuery = useQuery({
    queryKey: queryKeys.user.customerInfo(),
    queryFn: getCustomerInfo,
    staleTime: 1000 * 60 * 5, // 5 min — refresh in background
  });

  const offeringsQuery = useQuery({
    queryKey: queryKeys.user.offerings(),
    queryFn: getOfferings,
    staleTime: 1000 * 60 * 60, // 1 hour — packages don't change often
  });

  const purchase = useMutation<void, Error, PurchasesPackage>({
    mutationFn: async (pkg: PurchasesPackage) => {
      const customerInfo = await purchasePackage(pkg);
      if (isProEntitlement(customerInfo)) {
        await updateUserProStatus(true);
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        queryClient.invalidateQueries({ queryKey: queryKeys.user.customerInfo() });
      }
    },
  });

  const restore = useMutation<void, Error, void>({
    mutationFn: async () => {
      const customerInfo = await restorePurchases();
      const isPro = isProEntitlement(customerInfo);
      await updateUserProStatus(isPro);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.customerInfo() });
    },
  });

  const packages =
    offeringsQuery.data?.current?.availablePackages ?? [];
  const isPro = isProEntitlement(customerInfoQuery.data ?? null);

  return {
    isPro,
    customerInfo: customerInfoQuery.data ?? null,
    packages,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    purchase,
    restore,
  };
}
