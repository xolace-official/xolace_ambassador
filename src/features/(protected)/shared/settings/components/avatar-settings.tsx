import { ImagePlus, Loader2, UserRound } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export function AvatarSettings({
  image,
  uploading,
  onChange,
}: {
  image: string | null;
  uploading: boolean;
  onChange: (file: File | undefined) => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-4 sm:col-span-2">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
        {image ? (
          <Image
            src={image}
            alt="Current profile"
            width={80}
            height={80}
            className="size-full object-cover"
          />
        ) : (
          <UserRound aria-hidden="true" className="size-8" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">Profile image</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, or WebP. Maximum 5 MB.
        </p>
        <label
          htmlFor="profile-image-upload"
          className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-within:ring-2 focus-within:ring-ring"
        >
          {uploading ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ImagePlus aria-hidden="true" className="size-4" />
          )}
          {uploading ? "Uploading…" : image ? "Change image" : "Add image"}
        </label>
        <Input
          id="profile-image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => void onChange(event.target.files?.[0])}
        />
      </div>
    </div>
  );
}
