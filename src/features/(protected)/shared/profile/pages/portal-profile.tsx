"use client";

import { useQuery } from "convex/react";
import {
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  MapPin,
  Pencil,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../../../../../../convex/_generated/api";
import { AmbassadorNextSteps } from "../components/ambassador-next-steps";
import { AmbassadorProgress } from "../components/ambassador-progress";
import { ProfileAvatar } from "../components/profile-avatar";
import { ProfileCompletionCard } from "../components/profile-completion-card";
import { ProfileDetail } from "../components/profile-detail";
import { formatProfileLabel as formatLabel } from "../components/profile-format-label";
import { ProfileSkeleton } from "../components/profile-skeleton";
import { ProfileSocialLinks } from "../components/profile-social-links";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function PortalProfile({
  portalRole,
  uuid,
}: {
  portalRole: "admin" | "ambassador";
  uuid: string;
}) {
  const profile = useQuery(api.ambassadors.getProfile);

  if (profile === undefined) return <ProfileSkeleton />;

  const details = profile.profile;
  const displayName = profile.name || "Your profile";
  const completionFields =
    profile.role === "ambassador"
      ? [
          profile.name,
          profile.image,
          details?.location,
          details?.school,
          details?.bio,
        ]
      : [profile.name, profile.image];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="relative flex flex-col items-center p-4 text-center sm:items-start sm:p-6 sm:text-left">
            <Link
              href={`/${portalRole}/${uuid}/profile/edit`}
              className="absolute right-5 top-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-8 sm:top-8"
            >
              <Pencil aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Edit profile</span>
              <span className="sm:hidden">Edit</span>
            </Link>
            <ProfileAvatar image={profile.image} name={displayName} />
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
              {displayName}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-4" />
              {details?.location || "Location not provided"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="secondary">
                {profile.role === "admin" ? "Admin" : "Ambassador"}
              </Badge>
              {details?.track ? (
                <Badge variant="outline">{details.track}</Badge>
              ) : null}
              {details?.status ? (
                <Badge
                  variant={details.status === "active" ? "default" : "outline"}
                >
                  {formatLabel(details.status)}
                </Badge>
              ) : null}
            </div>
            {details?.bio ? (
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                {details.bio}
              </p>
            ) : null}
            <div className="mt-4 grid w-full gap-4 border-t border-border pt-4 text-left sm:grid-cols-3">
              <ProfileDetail
                icon={GraduationCap}
                label="School or organization"
                value={details?.school || "Not provided"}
              />
              <ProfileDetail
                icon={BriefcaseBusiness}
                label="Joined Xolace"
                value={dateFormatter.format(profile.joinedAt)}
              />
              {profile.role === "ambassador" ? (
                <ProfileDetail
                  icon={Share2}
                  label="Referral code"
                  value={profile.profile?.referralCode || "Not generated"}
                />
              ) : null}
              {details?.dateOfBirth ? (
                <ProfileDetail
                  icon={CalendarDays}
                  label="Date of birth"
                  value={new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "long",
                    timeZone: "UTC",
                  }).format(new Date(`${details.dateOfBirth}T00:00:00Z`))}
                />
              ) : null}
            </div>
            <ProfileSocialLinks socials={details?.socials} />
          </CardContent>
        </Card>

        <ProfileCompletionCard
          completion={completion}
          hasImage={Boolean(profile.image)}
          profile={details}
          role={profile.role}
          uuid={uuid}
        />
      </section>

      {profile.role === "ambassador" && profile.totals ? (
        <AmbassadorProgress profile={profile} />
      ) : null}

      {profile.role === "ambassador" ? (
        <AmbassadorNextSteps profile={profile} uuid={uuid} />
      ) : null}
    </div>
  );
}
