"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type SessionState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: Doc<"users"> };

export function useSessionUser(): SessionState {
  const user = useQuery(api.users.getMe);

  if (user === undefined) return { status: "loading" };
  if (user === null) return { status: "signedOut" };
  return { status: "signedIn", user };
}
