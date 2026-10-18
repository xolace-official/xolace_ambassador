import Image from "next/image";

interface LeaderboardAvatarProps {
  name: string;
  image: string | null;
  size: "sm" | "lg";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LeaderboardAvatar({
  name,
  image,
  size,
}: LeaderboardAvatarProps) {
  const className = size === "lg" ? "size-10 text-sm" : "size-8 text-xs";
  const px = size === "lg" ? 40 : 32;

  return image ? (
    <Image
      src={image}
      alt={`${name}'s profile`}
      width={px}
      height={px}
      className={`${className} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary`}
    >
      {getInitials(name)}
    </div>
  );
}
