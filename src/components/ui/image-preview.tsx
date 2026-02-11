"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "eager" | "lazy";
  fill?: boolean;
  quality?: number | `${number}`;
  sizes?: string
}

export default function ImagePreview({
  src = "https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  alt = "Preview image",
  width = 300,
  height = 300,
  className = "cursor-pointer rounded-lg hover:opacity-90 transition-opacity",
  loading,
  fill,
  quality
}: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={className}
        loading={loading}
        fill={fill}
        quality={quality}
        onClick={() => setIsOpen(true)}
      />

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 bg-transparent border-0 z-[51]">
            <VisuallyHidden.Root asChild>
              <DialogPrimitive.Title>{alt}</DialogPrimitive.Title>
            </VisuallyHidden.Root>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 focus:outline-none"
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </button>
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={alt}
                width={width ? width * 2 : undefined}
                height={height ? height * 2 : undefined}
                className="object-contain"
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
