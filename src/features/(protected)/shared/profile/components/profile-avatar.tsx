import { User } from "lucide-react";
import Image from "next/image";

export function ProfileAvatar({
  image,
  name,
}: {
  image: string | null;
  name: string;
}) {
  return (
    <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground ring-4 ring-muted/60 sm:size-28">
      {image ? (
        <Image
          src={image}
          alt={`${name} profile`}
          width={128}
          height={128}
          className="size-full object-cover"
        />
      ) : (
        <User aria-hidden="true" className="size-12" />
      )}
    </div>
  );
}
