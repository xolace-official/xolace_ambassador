"use client";

import { Instagram, MapPin, Twitter } from "lucide-react";
import { motion } from "motion/react";
import { LinkedIn } from "@/components/icons/linkedIn";
import { Snapchat } from "@/components/icons/snapchat";
import { TikTok } from "@/components/icons/tiktok-light";
import ImagePreview from "@/components/ui/image-preview";

// Mirrors the publicAmbassadors.list validator. Keep in step with it.
export interface PublicAmbassador {
  id: string;
  name: string;
  image: string | null;
  location: string | null;
  track: string | null;
  bio: string | null;
  joinedAt: number;
  peopleReached: number;
  missionsCompleted: number;
  eventsHosted: number;
  contributions: number;
  socials: {
    tiktok: string | null;
    instagram: string | null;
    x: string | null;
    youtube: string | null;
    linkedin: string | null;
    snapchat: string | null;
  } | null;
}

const MAX_STAGGER_DELAY = 0.5;

// Fixed tilt per card position, so the wall looks hand-placed rather than uniform
const ROTATIONS = [-3, 2, -2, 4, -4, 3, -3, 2, -2] as const;

const TRACK_LABELS: Record<string, string> = {
  creator: "Creator",
  community: "Community",
  growth: "Growth",
  creative: "Creative",
  production: "Production",
  advocacy: "Advocacy",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Handles are stored as bare usernames, so a bare `esmouah__` is not a URL.
function profileUrl(handle: string) {
  return handle.startsWith("http") ? handle : `https://${handle}`;
}

const iconClass =
  "flex size-7 items-center justify-center rounded-full bg-muted text-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none";

const linkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

const AmbassadorCard = ({
  ambassador,
  index,
}: {
  ambassador: PublicAmbassador;
  index: number;
}) => {
  const delay = Math.min(index * 0.08, MAX_STAGGER_DELAY);
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const socials = ambassador.socials;
  const hasSocials = socials ? Object.values(socials).some(Boolean) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      style={{ rotate }}
      className="relative rounded-2xl border border-border bg-card p-2.5 pb-4 shadow-lg transition-shadow duration-300 hover:shadow-2xl"
    >
      <div className="relative h-48 overflow-hidden rounded-xl bg-muted">
        {ambassador.image ? (
          <ImagePreview
            src={ambassador.image}
            alt={ambassador.name}
            fill
            loading="lazy"
            quality={80}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden="true"
              className="text-3xl font-bold text-muted-foreground/60"
            >
              {initials(ambassador.name)}
            </span>
          </div>
        )}
      </div>

      <div className="px-1.5 pt-3">
        <h3 className="text-base leading-tight font-bold text-foreground">
          {ambassador.name}
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-primary">
          {ambassador.track
            ? (TRACK_LABELS[ambassador.track] ?? ambassador.track)
            : "Ambassador"}
        </p>
        {ambassador.location ? (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3 shrink-0" />
            <span className="truncate">{ambassador.location}</span>
          </div>
        ) : null}

        {ambassador.bio ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {ambassador.bio}
          </p>
        ) : null}

        {hasSocials && socials ? (
          <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
            {socials.linkedin ? (
              <a
                {...linkProps}
                href={profileUrl(socials.linkedin)}
                aria-label={`${ambassador.name} on LinkedIn`}
                className={iconClass}
              >
                <LinkedIn
                  aria-hidden="true"
                  className="size-3.5 fill-current"
                />
              </a>
            ) : null}
            {socials.x ? (
              <a
                {...linkProps}
                href={profileUrl(socials.x)}
                aria-label={`${ambassador.name} on X`}
                className={iconClass}
              >
                <Twitter aria-hidden="true" className="size-3.5" />
              </a>
            ) : null}
            {socials.instagram ? (
              <a
                {...linkProps}
                href={profileUrl(socials.instagram)}
                aria-label={`${ambassador.name} on Instagram`}
                className={iconClass}
              >
                <Instagram aria-hidden="true" className="size-3.5" />
              </a>
            ) : null}
            {socials.tiktok ? (
              <a
                {...linkProps}
                href={profileUrl(socials.tiktok)}
                aria-label={`${ambassador.name} on TikTok`}
                className={iconClass}
              >
                <TikTok aria-hidden="true" className="size-3.5 fill-current" />
              </a>
            ) : null}
            {socials.snapchat ? (
              <a
                {...linkProps}
                href={profileUrl(socials.snapchat)}
                aria-label={`${ambassador.name} on Snapchat`}
                className={iconClass}
              >
                <Snapchat
                  aria-hidden="true"
                  className="size-3.5 fill-current"
                />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default AmbassadorCard;
