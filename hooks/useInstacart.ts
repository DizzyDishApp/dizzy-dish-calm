import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectInstacart } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { InstacartConnectRequest } from "@/types";

/**
 * Mutation hook for connecting Instacart account.
 */
export function useConnectInstacart() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, InstacartConnectRequest>({
    mutationFn: connectInstacart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.instacart.status() });
    },
  });
}
