export type ChipOption = { value: string; label: string };

type ChipChoiceProps =
  | { multiple?: false; value: string; onChange: (v: string) => void; options: ChipOption[] }
  | { multiple: true; value: string[]; onToggle: (v: string) => void; options: ChipOption[] };

/**
 * Plain wrapping chip buttons — flatten clicks, size to their own text (no
 * overflow), and give each option independent toggle control. Works for both
 * single-select and multi-select.
 */
export function ChipChoice(props: ChipChoiceProps) {
  const isSelected = (v: string) =>
    props.multiple ? props.value.includes(v) : props.value === v;
  const handle = (v: string) => (props.multiple ? props.onToggle(v) : props.onChange(v));

  return (
    <div className="flex flex-wrap gap-2">
      {props.options.map((o) => {
        const on = isSelected(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => handle(o.value)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              on
                ? "border-primary bg-primary/10 font-medium text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
