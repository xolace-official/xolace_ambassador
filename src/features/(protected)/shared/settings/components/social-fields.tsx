import type { useForm } from "react-hook-form";
import type { SettingsFormValues } from "../types/settings.types";
import { TextField } from "./text-field";

export function SocialFields({
  form,
}: {
  form: ReturnType<typeof useForm<SettingsFormValues>>;
}) {
  return (
    <div className="grid gap-5 border-t border-border pt-5 sm:col-span-2 sm:grid-cols-2">
      <TextField
        form={form}
        name="instagram"
        label="Instagram link"
        placeholder="https://instagram.com/…"
      />
      <TextField
        form={form}
        name="linkedin"
        label="LinkedIn link"
        placeholder="https://linkedin.com/in/…"
      />
      <TextField
        form={form}
        name="x"
        label="X link"
        placeholder="https://x.com/…"
      />
      <TextField
        form={form}
        name="tiktok"
        label="TikTok link"
        placeholder="https://tiktok.com/@…"
      />
      <TextField
        form={form}
        name="youtube"
        label="YouTube link"
        placeholder="https://youtube.com/…"
      />
      <TextField
        form={form}
        name="snapchat"
        label="Snapchat link"
        placeholder="https://snapchat.com/…"
      />
    </div>
  );
}
