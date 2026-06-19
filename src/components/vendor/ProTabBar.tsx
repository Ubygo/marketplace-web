"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProTabItem {
  href: string;
  label: string;
  activeIcon: string;
  inactiveIcon: string;
  showBadge?: boolean;
}

const PRO_TABS: ProTabItem[] = [
  {
    href: "/pro",
    label: "Accueil",
    activeIcon: "Ionicons/home",
    inactiveIcon: "Ionicons/home-outline",
  },
  {
    href: "/pro/commandes",
    label: "Commandes",
    activeIcon: "Ionicons/calendar",
    inactiveIcon: "Ionicons/calendar-outline",
  },
  {
    href: "/pro/prestations",
    label: "Prestations",
    activeIcon: "Ionicons/briefcase",
    inactiveIcon: "Ionicons/briefcase-outline",
  },
  {
    href: "/pro/messages",
    label: "Messages",
    activeIcon: "Ionicons/chatbubbles",
    inactiveIcon: "Ionicons/chatbubbles-outline",
    showBadge: true,
  },
  {
    href: "/pro/parametres",
    label: "Compte",
    activeIcon: "Ionicons/person",
    inactiveIcon: "Ionicons/person-outline",
  },
];

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/pro") {
    return pathname === "/pro";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ProTabBar() {
  const pathname = usePathname();
  const { hasUnreadMessages } = useUnreadMessages();

  return (
    <nav
      aria-label="Navigation espace pro"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
        {PRO_TABS.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const icon = active ? tab.activeIcon : tab.inactiveIcon;
          const showBadge = tab.showBadge && hasUnreadMessages;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-1 px-1 py-1.5"
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <CategoryIcon
                  icon={icon}
                  size={22}
                  color={active ? "var(--tenant-primary)" : TEXT_COLOR}
                />
                {showBadge ? (
                  <span
                    aria-hidden
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500"
                  />
                ) : null}
              </span>
              <span
                className={`text-[10px] font-medium leading-none ${
                  active ? "text-[var(--tenant-primary)]" : "text-black/50"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
