"use client";

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="sidebar-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Add-via-dropdown + removable chips. Handles large player pools. */
export function PlayerMultiSelect({
  label,
  options,
  value,
  onChange,
  max,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}) {
  const byId = new Map(options.map((o) => [o.id, o.label]));
  const atMax = max !== undefined && value.length >= max;
  const remaining = options.filter((o) => !value.includes(o.id));

  return (
    <div style={{ margin: "0.75rem 0" }}>
      <span className="sidebar-label">
        {label}
        {max ? ` (max ${max})` : ""}
      </span>
      <div className="chip-row">
        {value.map((id) => (
          <span
            key={id}
            className="chip on"
            onClick={() => onChange(value.filter((v) => v !== id))}
            title="Remove"
          >
            {byId.get(id) ?? id} ✕
          </span>
        ))}
      </div>
      <select
        value=""
        disabled={atMax || remaining.length === 0}
        onChange={(e) => {
          if (e.target.value) onChange([...value, e.target.value]);
        }}
      >
        <option value="">
          {atMax ? "Max selected" : "+ add player…"}
        </option>
        {remaining.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
