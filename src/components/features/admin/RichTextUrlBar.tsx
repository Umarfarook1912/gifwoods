"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
}

export function RichTextUrlBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
}: Props) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-cream/30 px-3 py-2">
      <input
        type="url"
        className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold/50"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-dark transition-colors hover:bg-gold-dark"
      >
        {submitLabel}
      </button>
    </div>
  );
}
