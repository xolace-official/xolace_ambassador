"use client";

import {
  type PaginatedQueryArgs,
  type PaginatedQueryReference,
  type UsePaginatedQueryReturnType,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import { useRef } from "react";

/**
 * `useQuery` that keeps returning the last loaded result while new args load,
 * instead of dropping back to `undefined`. Use when args change from user
 * interaction (filters, tabs) so the UI doesn't blank on every change.
 *
 * See https://stack.convex.dev/help-my-app-is-overreacting
 */
export const useStableQuery = ((name, ...args) => {
  const result = useQuery(name, ...args);
  const stored = useRef(result);

  if (result !== undefined) {
    stored.current = result;
  }

  return stored.current;
}) as typeof useQuery;

/**
 * `usePaginatedQuery` that keeps the previous rows while the first page for
 * new args loads, so filtered tables swap in place instead of unmounting.
 * Only a genuine first load reports `LoadingFirstPage`; `isStale` is true
 * while held rows are standing in for the new args.
 */
export function useStablePaginatedQuery<Query extends PaginatedQueryReference>(
  query: Query,
  args: PaginatedQueryArgs<Query> | "skip",
  options: { initialNumItems: number },
): UsePaginatedQueryReturnType<Query> & { isStale: boolean } {
  const result = usePaginatedQuery(query, args, options);
  const stored = useRef(result);

  // `LoadingMore` already carries the loaded rows, so only the first-page
  // reset after an arg change needs masking.
  if (result.status !== "LoadingFirstPage") {
    stored.current = result;
  }

  return {
    ...stored.current,
    // The held `loadMore` belongs to the previous args.
    loadMore: result.loadMore,
    isStale:
      result.status === "LoadingFirstPage" &&
      stored.current.status !== "LoadingFirstPage",
  };
}
