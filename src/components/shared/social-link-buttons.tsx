import {
  Instagram,
  Link2,
  type LucideIcon,
  Twitter,
  Youtube,
} from "lucide-react";
import { LinkedIn } from "@/components/icons/linkedIn";
import { Snapchat } from "@/components/icons/snapchat";
import { TikTok } from "@/components/icons/tiktok-light";

export type SocialLink = {
  label: string;
  value: string;
};

const iconClass = "size-4 shrink-0";

export function SocialLinkButtons({ links }: { links: SocialLink[] }) {
  const visibleLinks = links
    .map((link) => ({ ...link, value: toSocialUrl(link.label, link.value) }))
    .filter((link): link is SocialLink => link.value !== null);

  if (!visibleLinks.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleLinks.map((link) => {
        const Icon = socialIcon(link.label, link.value);
        return (
          <a
            key={`${link.label}-${link.value}`}
            href={link.value}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${link.label} profile`}
            title={`Open ${link.label} profile`}
            className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon aria-hidden="true" className={iconClass} />
          </a>
        );
      })}
    </div>
  );
}

function socialIcon(
  label: string,
  value: string,
): LucideIcon | typeof LinkedIn {
  switch (socialPlatform(label, value)) {
    case "instagram":
      return Instagram;
    case "linkedin":
      return LinkedIn;
    case "tiktok":
      return TikTok;
    case "snapchat":
      return Snapchat;
    case "youtube":
      return Youtube;
    case "x":
    case "twitter":
      return Twitter;
    default:
      return Link2;
  }
}

function socialPlatform(label: string, value: string) {
  const normalizedLabel = label.toLowerCase();
  const knownPlatforms = new Set([
    "instagram",
    "linkedin",
    "tiktok",
    "snapchat",
    "youtube",
    "x",
    "twitter",
  ]);
  if (knownPlatforms.has(normalizedLabel)) {
    return normalizedLabel;
  }

  try {
    const hostname = new URL(value).hostname.toLowerCase();
    if (hostname.includes("instagram")) return "instagram";
    if (hostname.includes("linkedin")) return "linkedin";
    if (hostname.includes("tiktok")) return "tiktok";
    if (hostname.includes("snapchat")) return "snapchat";
    if (hostname.includes("youtube") || hostname === "youtu.be") {
      return "youtube";
    }
    if (hostname === "x.com" || hostname.includes("twitter")) return "x";
  } catch {
    return normalizedLabel;
  }

  return normalizedLabel;
}

function toSocialUrl(label: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const prefixes: Record<string, string> = {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/in/",
    tiktok: "https://tiktok.com/@",
    snapchat: "https://snapchat.com/add/",
    youtube: "https://youtube.com/@",
    x: "https://x.com/",
    twitter: "https://x.com/",
  };
  const prefix = prefixes[label.toLowerCase()];
  return prefix ? `${prefix}${trimmed.replace(/^@/, "")}` : null;
}
