"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useVendor } from "@/contexts/VendorContext";
import { useIsProMode } from "@/hooks/useIsProMode";
import { getUserInitials } from "@/lib/user-display";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface HeaderUserMenuProps {
  primaryColor: string;
}

const MENU_ITEM_CLASS =
  "mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-full px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-neutral-100";

const CLIENT_MENU_ITEMS = [
  { href: "/favoris", label: "Favoris", icon: "Ionicons/heart-outline" },
  { href: "/commandes", label: "Commandes", icon: "Ionicons/receipt-outline" },
  { href: "/messages", label: "Messages", icon: "Ionicons/chatbubble-outline" },
  {
    href: "/parametres",
    label: "Profil",
    icon: "Ionicons/person-circle-outline",
  },
] as const;

const VENDOR_CLIENT_MENU_ITEM = {
  href: "/pro",
  label: "Espace pro",
  icon: "Ionicons/briefcase-outline",
} as const;

const PRO_MENU_ITEMS = [
  { href: "/pro", label: "Tableau de bord", icon: "Ionicons/grid-outline" },
  {
    href: "/pro/messages",
    label: "Messages",
    icon: "Ionicons/chatbubble-outline",
  },
  {
    href: "/pro/parametres",
    label: "Paramètres",
    icon: "Ionicons/settings-outline",
  },
] as const;

function MenuItemIcon({
  icon,
  showBadge = false,
}: {
  icon: string;
  showBadge?: boolean;
}) {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      <CategoryIcon icon={icon} size={20} color={TEXT_COLOR} />
      {showBadge ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500"
        />
      ) : null}
    </span>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onNavigate,
  showBadge = false,
}: {
  href: string;
  icon: string;
  label: string;
  onNavigate: () => void;
  showBadge?: boolean;
}) {
  return (
    <Link href={href} onClick={onNavigate} className={MENU_ITEM_CLASS}>
      <MenuItemIcon icon={icon} showBadge={showBadge} />
      <span>{label}</span>
    </Link>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  children,
}: {
  icon?: string;
  label: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={MENU_ITEM_CLASS}>
      {icon ? <MenuItemIcon icon={icon} /> : null}
      <span>{children ?? label}</span>
    </button>
  );
}

export default function HeaderUserMenu({ primaryColor }: HeaderUserMenuProps) {
  const { user, logout } = useAuth();
  const { hasUnreadMessages, refreshUnreadMessages } = useUnreadMessages();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();
  const isProMode = useIsProMode();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !user) return;
    void refreshUnreadMessages();
  }, [open, refreshUnreadMessages, user]);

  if (!user) {
    return null;
  }

  const menuItems = isProMode
    ? PRO_MENU_ITEMS
    : [
        ...(hasVendor && !isVendorLoading ? [VENDOR_CLIENT_MENU_ITEM] : []),
        ...CLIENT_MENU_ITEMS,
      ];

  const messagesHref = isProMode ? "/pro/messages" : "/messages";

  function closeMenu() {
    setOpen(false);
  }

  function handleLogoutRequest() {
    closeMenu();
    setShowLogoutConfirm(true);
  }

  function handleLogoutConfirm() {
    setShowLogoutConfirm(false);
    logout();
    router.push("/");
  }

  return (
    <>
      <div ref={containerRef} className="relative flex items-center gap-2">
        <div
          aria-label="Profil utilisateur"
          className="flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {getUserInitials(user)}
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white transition-colors hover:bg-neutral-100"
        >
          <CategoryIcon icon="Ionicons/menu" size={22} color={TEXT_COLOR} />
        </button>

        {open ? (
          <nav
            aria-label="Menu utilisateur"
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white py-2 shadow-lg"
          >
            {menuItems.map((item) => (
              <MenuLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onNavigate={closeMenu}
                showBadge={item.href === messagesHref && hasUnreadMessages}
              />
            ))}

            <div className="my-2 border-t border-black/10" />

            <MenuLink
              href="/aide"
              icon="Ionicons/help-circle-outline"
              label="Centre d'aide"
              onNavigate={closeMenu}
            />

            <div className="my-2 border-t border-black/10" />

            <MenuButton
              icon="Ionicons/log-out-outline"
              label="Déconnexion"
              onClick={handleLogoutRequest}
            />
          </nav>
        ) : null}
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Se déconnecter ?"
        description="Voulez-vous vraiment vous déconnecter de votre compte ?"
        confirmLabel="Déconnexion"
        cancelLabel="Annuler"
        destructive
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
