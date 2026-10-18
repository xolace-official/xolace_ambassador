import { Save } from "lucide-react";
import type { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Settings, SettingsFormValues } from "../types/settings.types";
import { AvatarSettings } from "./avatar-settings";
import { FormError } from "./form-error";
import { SettingRow } from "./setting-row";
import { SocialFields } from "./social-fields";
import { TextField } from "./text-field";

export function ProfileSettings({
  settings,
  editing,
  setEditing,
  form,
  onSubmit,
  image,
  uploadingAvatar,
  onAvatarChange,
}: {
  settings: Settings;
  editing: boolean;
  setEditing: (value: boolean) => void;
  form: ReturnType<typeof useForm<SettingsFormValues>>;
  onSubmit: (values: SettingsFormValues) => Promise<void>;
  image: string | null;
  uploadingAvatar: boolean;
  onAvatarChange: (file: File | undefined) => Promise<void>;
}) {
  return (
    <section className="space-y-5">
      {editing ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AvatarSettings
              image={image}
              uploading={uploadingAvatar}
              onChange={onAvatarChange}
            />
            <div className="grid gap-2">
              <Label htmlFor="settings-name">Full name</Label>
              <Input
                id="settings-name"
                value={settings.name ?? ""}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                This is the name on your application. Contact an admin if it
                needs to change.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settings-email">Email address</Label>
              <Input
                id="settings-email"
                value={settings.email ?? ""}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Contact an admin if this needs to change.
              </p>
            </div>
            {settings.role === "ambassador" ? (
              <>
                <TextField
                  form={form}
                  name="location"
                  label="Location"
                  placeholder="City or region…"
                />
                <TextField
                  form={form}
                  name="school"
                  label="School or organization"
                  placeholder="Your school or organization…"
                />
                <div className="grid gap-2">
                  <Label htmlFor="settings-date-of-birth">Date of birth</Label>
                  <Input
                    id="settings-date-of-birth"
                    type="date"
                    autoComplete="bday"
                    {...form.register("dateOfBirth")}
                  />
                  <FormError
                    message={form.formState.errors.dateOfBirth?.message}
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="settings-bio">Bio</Label>
                  <Textarea
                    id="settings-bio"
                    rows={4}
                    placeholder="Tell the community about yourself…"
                    {...form.register("bio")}
                  />
                  <FormError message={form.formState.errors.bio?.message} />
                </div>
                <SocialFields form={form} />
              </>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="gap-2"
            >
              <Save aria-hidden="true" className="size-4" />
              {form.formState.isSubmitting ? "Saving…" : "Save profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <SettingRow
            label="Full name"
            value={settings.name || "Not provided"}
          />
          <SettingRow
            label="Email address"
            value={settings.email || "Not provided"}
          />
          {settings.role === "ambassador" ? (
            <>
              <SettingRow
                label="Location"
                value={settings.profile?.location || "Not provided"}
                editable
                onEdit={() => setEditing(true)}
              />
              <SettingRow
                label="School or organization"
                value={settings.profile?.school || "Not provided"}
                editable
                onEdit={() => setEditing(true)}
              />
              <SettingRow
                label="Date of birth"
                value={
                  settings.profile?.dateOfBirth
                    ? new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "long",
                        timeZone: "UTC",
                      }).format(
                        new Date(`${settings.profile.dateOfBirth}T00:00:00Z`),
                      )
                    : "Not provided"
                }
                editable
                onEdit={() => setEditing(true)}
              />
              <SettingRow
                label="Bio"
                value={settings.profile?.bio || "Not provided"}
                editable
                onEdit={() => setEditing(true)}
              />
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </Button>
        </div>
      )}
    </section>
  );
}
