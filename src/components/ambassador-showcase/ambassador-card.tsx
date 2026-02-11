"use client";

import { motion } from "motion/react";
import { Linkedin, Twitter, Instagram, MapPin } from "lucide-react";
import Image from "next/image";

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
  };
  joinedDate: string;
}

const MAX_STAGGER_DELAY = 0.5;

const AmbassadorCard = ({
  ambassador,
  index,
}: {
  ambassador: Ambassador;
  index: number;
}) => {
  const delay = Math.min(index * 0.1, MAX_STAGGER_DELAY);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group border border-border"
    >
      {/* Ambassador Image */}
      <div className="relative h-64 bg-muted overflow-hidden">
        <Image
          src={ambassador.image}
          alt={ambassador.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Ambassador Info */}
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-foreground">
            {ambassador.name}
          </h3>
          <p className="text-primary font-medium mb-1">{ambassador.role}</p>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin aria-hidden="true" className="w-4 h-4 mr-1" />
            {ambassador.location}
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {ambassador.bio}
        </p>

        {/* Impact Stats */}
        <div className="bg-muted/50 rounded-xl p-2 mb-4 border border-border">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-primary tabular-nums">
                {ambassador.impact.peopleReached}
              </div>
              <div className="text-xs text-muted-foreground">Reached</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary tabular-nums">
                {ambassador.impact.eventsHosted}
              </div>
              <div className="text-xs text-muted-foreground">Events</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary tabular-nums">
                {ambassador.impact.communitiesServed}
              </div>
              <div className="text-xs text-muted-foreground">Communities</div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {ambassador.social.linkedin ? (
              <a
                href={ambassador.social.linkedin}
                aria-label={`${ambassador.name} on LinkedIn`}
                className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin aria-hidden="true" className="w-4 h-4" />
              </a>
            ) : null}
            {ambassador.social.twitter ? (
              <a
                href={ambassador.social.twitter}
                aria-label={`${ambassador.name} on Twitter`}
                className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter aria-hidden="true" className="w-4 h-4" />
              </a>
            ) : null}
            {ambassador.social.instagram ? (
              <a
                href={ambassador.social.instagram}
                aria-label={`${ambassador.name} on Instagram`}
                className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram aria-hidden="true" className="w-4 h-4" />
              </a>
            ) : null}
          </div>
          <div
            className="text-xs text-muted-foreground"
            suppressHydrationWarning
          >
            Since{" "}
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "long",
            }).format(new Date(ambassador.joinedDate))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AmbassadorCard;
