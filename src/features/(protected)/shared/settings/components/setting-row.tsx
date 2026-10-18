export function SettingRow({
  label,
  value,
  editable,
  onEdit,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0 sm:gap-6 sm:pb-5">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <p className="mt-1 break-words text-sm text-muted-foreground">
          {value}
        </p>
      </div>
      {editable ? (
        <button
          type="button"
          onClick={onEdit}
          className="-mr-2 min-h-11 shrink-0 px-2 text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Edit
        </button>
      ) : null}
    </div>
  );
}
