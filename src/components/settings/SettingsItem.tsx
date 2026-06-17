import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import type { ReactNode } from "react";

interface SettingsItemProps {
  icon: string;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  badge?: string;
  trailing?: ReactNode;
}

export default function SettingsItem({
  icon,
  title,
  description,
  onClick,
  href,
  disabled = false,
  badge,
  trailing,
}: SettingsItemProps) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5">
        <CategoryIcon icon={icon} size={20} color={TEXT_COLOR} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-sm font-semibold text-black">{title}</span>
          {badge ? (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/60">
              {badge}
            </span>
          ) : null}
        </span>
        {description ? (
          <span className="mt-0.5 block text-sm text-black/60">{description}</span>
        ) : null}
      </span>

      {trailing ?? (
        <CategoryIcon
          icon="Ionicons/chevron-forward"
          size={18}
          color="rgba(0,0,0,0.35)"
        />
      )}
    </>
  );

  const className = `flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
    disabled
      ? "cursor-default opacity-60"
      : "cursor-pointer hover:bg-black/[0.02]"
  }`;

  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled && !onClick}
      className={className}
    >
      {content}
    </button>
  );
}
