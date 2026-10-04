"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const settingsTabs = [
  {
    value: "profile",
    label: "Profile",
    icon: UserRound,
    description: "Your identity and public details",
  },
  {
    value: "program",
    label: "Program & safety",
    icon: BriefcaseBusiness,
    description: "Your role, track, pod, and safety commitments",
  },
  {
    value: "account",
    label: "Account & security",
    icon: ShieldCheck,
    description: "Your sign-in and account access",
  },
] as const;
const settingsTabParser = parseAsStringLiteral(
  settingsTabs.map((tab) => tab.value),
).withDefault("profile");

import { AccountSettings } from "../components/account-settings";
import { ProfileSettings } from "../components/profile-settings";
import { ProgramSettings } from "../components/program-settings";
import { SettingsCard } from "../components/settings-card";
import { SettingsSkeleton } from "../components/settings-skeleton";
import {
  emptyValues,
  type Settings,
  type SettingsFormValues,
  settingsSchema,
} from "../types/settings.types";

export function PortalSettings() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const generateAvatarUploadUrl = useMutation(
    api.settings.generateAvatarUploadUrl,
  );
  const saveAvatar = useMutation(api.settings.saveAvatar);
  const acknowledgeSafety = useMutation(api.settings.acknowledgeSafety);
  const [selectedTab, setSelectedTab] = useQueryState(
    "section",
    settingsTabParser,
  );
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!settings) return;
    form.reset({
      name: settings.name ?? "",
      location: settings.profile?.location ?? "",
      school: settings.profile?.school ?? "",
      dateOfBirth: settings.profile?.dateOfBirth ?? "",
      bio: settings.profile?.bio ?? "",
      tiktok: settings.profile?.tiktok ?? "",
      instagram: settings.profile?.instagram ?? "",
      x: settings.profile?.x ?? "",
      youtube: settings.profile?.youtube ?? "",
      linkedin: settings.profile?.linkedin ?? "",
      snapchat: settings.profile?.snapchat ?? "",
    });
  }, [form, settings]);

  async function onSubmit(values: SettingsFormValues) {
    try {
      await updateSettings(values);
      setEditing(false);
      toast.success("Profile saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save your profile.",
      );
    }
  }

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image smaller than 5 MB.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const uploadUrl = await generateAvatarUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("Could not upload your profile image.");
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      await saveAvatar({ storageId });
      toast.success("Profile image updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload your profile image.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSafetyAcknowledgement() {
    try {
      await acknowledgeSafety();
      toast.success("Safety acknowledgement completed");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save your acknowledgement.",
      );
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } catch {
      setIsSigningOut(false);
      toast.error("Could not sign out. Try again.");
    }
  }

  if (settings === undefined) return <SettingsSkeleton />;
  const typedSettings = settings as Settings;

  return (
    <div className="w-full space-y-6">
      <PageDescription page="settings" className="max-w-2xl" />
      <nav
        aria-label="Settings sections"
        className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-border bg-muted/30 p-2 sm:grid sm:grid-cols-3 sm:overflow-visible"
      >
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              aria-current={isSelected ? "page" : undefined}
              onClick={() => {
                void setSelectedTab(tab.value);
                setEditing(false);
              }}
              className={`flex min-h-11 min-w-[9.5rem] shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-14 sm:min-w-0 sm:gap-3 sm:px-4 ${isSelected ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"}`}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {tab.label}
                </span>
                <span className="hidden truncate text-xs sm:block">
                  {tab.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
      <main className="min-w-0">
        {selectedTab === "profile" ? (
          <SettingsCard
            icon={UserRound}
            title="Profile"
            description="The information members and the Xolace team use to know you."
          >
            <ProfileSettings
              settings={typedSettings}
              editing={editing}
              setEditing={setEditing}
              form={form}
              onSubmit={onSubmit}
              image={settings.image}
              uploadingAvatar={uploadingAvatar}
              onAvatarChange={handleAvatarChange}
            />
          </SettingsCard>
        ) : selectedTab === "program" ? (
          <SettingsCard
            icon={BriefcaseBusiness}
            title="Program & safety"
            description="Your place in the ambassador program and its commitments."
          >
            <ProgramSettings
              settings={typedSettings}
              onAcknowledge={handleSafetyAcknowledgement}
            />
          </SettingsCard>
        ) : (
          <SettingsCard
            icon={ShieldCheck}
            title="Account & security"
            description="Manage access to your Xolace portal account."
          >
            <AccountSettings
              settings={typedSettings}
              isSigningOut={isSigningOut}
              onSignOut={handleSignOut}
            />
          </SettingsCard>
        )}
      </main>
    </div>
  );
}
