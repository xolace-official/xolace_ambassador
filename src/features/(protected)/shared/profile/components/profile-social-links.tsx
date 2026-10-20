import { SocialLinkButtons } from "@/components/shared/social-link-buttons";

export function ProfileSocialLinks({
  socials,
}: {
  socials?: Record<string, string | null>;
}) {
  const links = Object.entries(socials ?? {})
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([label, value]) => ({
      label: label === "x" ? "X" : label[0]?.toUpperCase() + label.slice(1),
      value,
    }));

  return links.length ? <SocialLinkButtons links={links} /> : null;
}
