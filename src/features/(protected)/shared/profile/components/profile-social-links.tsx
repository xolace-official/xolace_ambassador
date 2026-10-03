import { Link2 } from "lucide-react";

import { formatProfileLabel as formatLabel } from "./profile-format-label";

export function ProfileSocialLinks({
  socials,
}: {
  socials?: Record<string, string | null>;
}) {
  const links = Object.entries(socials ?? {}).filter(
    ([, value]) => value && /^https?:\/\//i.test(value),
  );
  if (!links.length) return null;

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-border pt-5 sm:justify-start">
      {links.map(([label, value]) => (
        <a
          key={label}
          href={value ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Link2 aria-hidden="true" className="size-4" />
          {formatLabel(label)}
        </a>
      ))}
    </div>
  );
}
