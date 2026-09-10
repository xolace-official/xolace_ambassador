"use client";

import { Instagram, MapPin, Twitter } from "lucide-react";
import { motion } from "motion/react";
import { GitHub } from "@/components/icons/github";
import { LinkedIn } from "@/components/icons/linkedIn";
import { Snapchat } from "@/components/icons/snapchat";
import { TikTok } from "@/components/icons/tiktok-light";
import ImagePreview from "@/components/ui/image-preview";

interface Ambassador {
  id: number;
  name: string;
  role: string;
  location: string;
  image: string;
  bio: string;
  impact: {
    peopleReached: string;
    eventsHosted: number;
    communitiesServed: number;
  };
  social: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    github?: string;
    snapchat?: string;
  };
  joinedDate: string;
  new: boolean;
  roles?: string[];
}

const MAX_STAGGER_DELAY = 0.5;

// Fixed tilt per card position, so the wall looks hand-placed rather than uniform
const ROTATIONS = [-3, 2, -2, 4, -4, 3, -3, 2, -2] as const;

const AmbassadorCard = ({
  ambassador,
  index,
}: {
  ambassador: Ambassador;
  index: number;
}) => {
  const delay = Math.min(index * 0.08, MAX_STAGGER_DELAY);
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const hasSocials = Object.values(ambassador.social).some(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      style={{ rotate }}
      className="relative bg-card rounded-2xl p-2.5 pb-4 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border"
    >
      <div className="relative h-48 rounded-xl overflow-hidden bg-muted">
        <ImagePreview
          src={ambassador.image}
          alt={ambassador.name}
          fill
          loading="lazy"
          quality={80}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top"
        />
        {ambassador.new ? (
          <span className="absolute top-2 right-2 px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
            New
          </span>
        ) : null}
      </div>

      <div className="pt-3 px-1.5">
        <h3 className="text-base font-bold text-foreground leading-tight">
          {ambassador.name}
        </h3>
        <p className="text-xs font-semibold text-primary mt-0.5">
          {ambassador.role}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin aria-hidden="true" className="w-3 h-3 shrink-0" />
          {ambassador.location}
        </div>

        {ambassador.roles && ambassador.roles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {ambassador.roles.map((role) => (
              <span
                key={role}
                className="px-2 py-0.5 text-[11px] font-medium bg-secondary text-secondary-foreground rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        ) : null}

        {hasSocials ? (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
            {ambassador.social.linkedin ? (
              <a
                href={ambassador.social.linkedin}
                aria-label={`${ambassador.name} on LinkedIn`}
                className="w-7 h-7 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedIn
                  aria-hidden="true"
                  className="w-3.5 h-3.5 fill-current"
                />
              </a>
            ) : null}
            {ambassador.social.twitter ? (
              <a
                href={ambassador.social.twitter}
                aria-label={`${ambassador.name} on Twitter`}
                className="w-7 h-7 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter aria-hidden="true" className="w-3.5 h-3.5" />
              </a>
            ) : null}
            {ambassador.social.instagram ? (
              <a
                href={ambassador.social.instagram}
                aria-label={`${ambassador.name} on Instagram`}
                className="w-7 h-7 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram aria-hidden="true" className="w-3.5 h-3.5" />
              </a>
            ) : null}
            {ambassador.social.tiktok ? (
              <a
                href={ambassador.social.tiktok}
                aria-label={`${ambassador.name} on TikTok`}
                className="w-7 h-7 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TikTok
                  aria-hidden="true"
                  className="w-3.5 h-3.5 fill-current"
                />
              </a>
            ) : null}
            {ambassador.social.github ? (
              <a
                href={ambassador.social.github}
                aria-label={`${ambassador.name} on GitHub`}
                className="w-7 h-7 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub
                  aria-hidden="true"
                  className="w-3.5 h-3.5 fill-current"
                />
              </a>
            ) : null}
            {ambassador.social.snapchat ? (
              <a
                href={ambassador.social.snapchat}
                aria-label={`${ambassador.name} on Snapchat`}
                className="hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Snapchat aria-hidden="true" className="w-7 h-7 fill-current" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default AmbassadorCard;
