"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SubmissionImageGallery({
  urls,
  label = "Submitted images",
}: {
  urls: string[];
  label?: string;
}) {
  if (urls.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
        <ImageIcon aria-hidden="true" className="size-4" />
        {label} ({urls.length})
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {urls.map((url, index) => (
          <Dialog key={url}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View submitted image ${index + 1}`}
              >
                <Image
                  src={url}
                  alt={`${label} ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-1rem)] max-w-4xl p-3 sm:w-full sm:p-5">
              <DialogHeader>
                <DialogTitle>
                  {label} {index + 1} of {urls.length}
                </DialogTitle>
                <DialogDescription>
                  Select the close button when you are finished viewing the
                  image.
                </DialogDescription>
              </DialogHeader>
              <Image
                src={url}
                alt={`${label} ${index + 1}`}
                width={1200}
                height={900}
                unoptimized
                className="mx-auto max-h-[70vh] w-full rounded-lg object-contain"
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
