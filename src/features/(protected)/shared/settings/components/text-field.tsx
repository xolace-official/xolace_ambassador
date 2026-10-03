import type { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsFormValues } from "../types/settings.types";
import { FormError } from "./form-error";

export function TextField({
  form,
  name,
  label,
  placeholder,
  defaultValue,
  autoComplete,
}: {
  form: ReturnType<typeof useForm<SettingsFormValues>>;
  name: keyof SettingsFormValues;
  label: string;
  placeholder: string;
  defaultValue?: string;
  autoComplete?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={`settings-${name}`}>{label}</Label>
      <Input
        id={`settings-${name}`}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        {...form.register(name, {
          setValueAs: (value: unknown) =>
            typeof value === "string" ? value.trim() : value,
        })}
      />
      <FormError message={form.formState.errors[name]?.message} />
    </div>
  );
}
