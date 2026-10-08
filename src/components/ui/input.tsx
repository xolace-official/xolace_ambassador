import { cn } from "cn";
import type * as React from "react";

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
        // iOS draws date segments at an intrinsic height taller than h-9, so the
        // value overflowed and the picker indicator overlapped it. Dropping the
        // native chrome lets the segments take our font and line-height, which
        // keeps the control exactly h-9 like every other input. Tapping it still
        // opens the native picker.
        isDateLike &&
          "appearance-none [&::-webkit-date-and-time-value]:min-h-0 [&::-webkit-date-and-time-value]:flex [&::-webkit-date-and-time-value]:items-center [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:flex [&::-webkit-datetime-edit]:items-center [&::-webkit-datetime-edit]:overflow-hidden [&::-webkit-calendar-picker-indicator]:ml-1 [&::-webkit-calendar-picker-indicator]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
