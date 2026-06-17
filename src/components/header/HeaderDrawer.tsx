"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import Link from "next/link";
import { useEffect } from "react";

export interface HeaderNavItem {
  href: string;
  label: string;
  mobileOnly?: boolean;
}

interface HeaderDrawerProps {
  open: boolean;
  onClose: () => void;
  primaryColor: string;
  items?: HeaderNavItem[];
}

const DEFAULT_ITEMS: HeaderNavItem[] = [
  { href: "/login", label: "Connexion", mobileOnly: true },
];

export default function HeaderDrawer({
  open,
  onClose,
  primaryColor,
  items = DEFAULT_ITEMS,
}: HeaderDrawerProps) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer le menu"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-end p-4">
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl"
          >
            <CategoryIcon icon="Ionicons/close" size={24} color={TEXT_COLOR} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 pb-6">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                item.mobileOnly ? "md:hidden" : ""
              }`}
              style={
                item.href === "/login" || item.href === "/parametres"
                  ? { backgroundColor: primaryColor, color: "#FFFFFF" }
                  : { color: TEXT_COLOR }
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
