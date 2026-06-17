import type { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthField({ label, id, className, ...props }: AuthFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-black">{label}</span>
      <input
        id={fieldId}
        className={`rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black/30 ${className ?? ""}`}
        {...props}
      />
    </label>
  );
}
