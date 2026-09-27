import { cn } from "@/lib/utils";

// Tailwind only emits class names it can see in the source, so the clamp has to
// be a static lookup rather than `line-clamp-${lines}`.
const clampClass = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
} as const;

type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] };

const BULLET = /^•\s*/;
const NUMBERED = /^\d+\.\s*/;

// Briefs are authored as plain text with blank-line block breaks. Rendering one
// into a single <p> would collapse every newline into a space, so blocks are
// separated and lists are detected.
function toBlocks(text: string): Block[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block): Block => {
      const lines = block.split("\n").map((line) => line.trim());

      if (lines.every((line) => BULLET.test(line))) {
        return {
          kind: "bullets",
          items: lines.map((l) => l.replace(BULLET, "")),
        };
      }

      if (lines.every((line) => NUMBERED.test(line))) {
        return {
          kind: "numbered",
          items: lines.map((l) => l.replace(NUMBERED, "")),
        };
      }

      return { kind: "paragraph", text: lines.join(" ") };
    });
}

interface MissionDescriptionProps {
  text: string;
  /** Omit to render the full brief with its block structure. */
  lines?: keyof typeof clampClass;
  className?: string;
}

export function MissionDescription({
  text,
  lines,
  className,
}: MissionDescriptionProps) {
  return (
    <div
      className={cn(
        "space-y-4 text-pretty text-sm leading-6 text-foreground/70",
        lines && "space-y-0",
        lines && clampClass[lines],
        className,
      )}
    >
      {toBlocks(text).map((block) => {
        if (block.kind === "bullets") {
          return (
            <ul
              key={block.items[0]}
              className="list-disc space-y-2 pl-5 marker:text-foreground/40"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.kind === "numbered") {
          return (
            <ol
              key={block.items[0]}
              className="list-decimal space-y-2 pl-5 marker:text-foreground/40"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          );
        }

        return <p key={block.text.slice(0, 24)}>{block.text}</p>;
      })}
    </div>
  );
}
