import { Link2 } from "lucide-react";

import { formatProfileLabel as formatLabel } from "./profile-format-label";

export function ProfileSocialLinks({
  socials,
}: {
  socials?: Record<string, string | null>;
}) {
  const links = Object.entries(socials ?? {})
    .map(([label, value]) => ({ label, value: socialUrl(label, value) }))
    .filter(
      (link): link is { label: string; value: string } => link.value !== null,
    );
  if (!links.length) return null;

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-border pt-3 sm:justify-start">
      {links.map(({ label, value }) => (
        <a
          key={label}
          href={value ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 w-28 items-center justify-center gap-1.5 rounded-lg border border-border px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Link2 aria-hidden="true" className="size-4" />
          {formatLabel(label)}
        </a>
      ))}
    </div>
  );
}

function socialUrl(label: string, value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const prefixes: Record<string, string> = {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/in/",
    x: "https://x.com/",
    youtube: "https://youtube.com/@",
    tiktok: "https://tiktok.com/@",
    snapchat: "https://snapchat.com/add/",
  };
  const prefix = prefixes[label];
  return prefix ? `${prefix}${trimmed.replace(/^@/, "")}` : null;
}
