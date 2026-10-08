import { cn } from "cn";
import type * as React from "react";

// iOS renders these with intrinsic height larger than the h-9 the other inputs
// use, so a fixed height clips the value and lets the picker indicator overlap
// it. min-h-9 keeps the control on the same rhythm while letting it grow.
const DATE_LIKE_TYPES = new Set([
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
]);

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const isDateLike = type !== undefined && DATE_LIKE_TYPES.has(type);

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        isDateLike &&
          "h-auto min-h-9 [&::-webkit-date-and-time-value]:min-h-9 [&::-webkit-date-and-time-value]:items-center [&::-webkit-calendar-picker-indicator]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
