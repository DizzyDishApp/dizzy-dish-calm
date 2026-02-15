import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile, fetchSubscription } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { User, SubscriptionPlan } from "@/types";

/**
 * Query hook for fetching the user profile.
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
