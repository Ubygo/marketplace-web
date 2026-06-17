"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import type { InputHTMLAttributes } from "react";
import { useState } from "react";

interface AuthPasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export default function AuthPasswordField({
  label,
  id,
  className,
  ...props
}: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-black">{label}</span>
      <div className="relative">
        <input
          id={fieldId}
          type={isVisible ? "text" : "password"}
          className={`w-full rounded-xl border border-black/10 bg-white py-3 pl-4 pr-11 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black/30 ${className ?? ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={
            isVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-black/50 transition-colors hover:text-black"
        >
          <CategoryIcon
            icon={
              isVisible ? "Ionicons/eye-off-outline" : "Ionicons/eye-outline"
            }
            size={18}
            color={TEXT_COLOR}
          />
        </button>
      </div>
    </label>
  );
}
