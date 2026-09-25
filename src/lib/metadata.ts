import type { Metadata } from "next";

const NO_INDEX = { index: false, follow: false } as const;

// The portal is per-user and behind a login, so it is never indexed. The
// layout supplies the `title.template`, which is why pages pass a short title.
export function portalMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    robots: NO_INDEX,
  };
}
