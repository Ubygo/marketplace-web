"use client";

import { TEXT_COLOR } from "@/constants/theme";

export type VendorDetailTab = "about" | "services" | "gallery" | "reviews";

interface VendorDetailTabsProps {
  selectedTab: VendorDetailTab;
  onTabChange: (tab: VendorDetailTab) => void;
  showServicesTab: boolean;
  showGalleryTab: boolean;
}

const TABS: { id: VendorDetailTab; label: string }[] = [
  { id: "about", label: "À propos" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Galerie" },
  { id: "reviews", label: "Avis" },
];

export default function VendorDetailTabs({
  selectedTab,
  onTabChange,
  showServicesTab,
  showGalleryTab,
}: VendorDetailTabsProps) {
  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "services") {
      return showServicesTab;
    }
    if (tab.id === "gallery") {
      return showGalleryTab;
    }
    return true;
  });

  return (
    <div className="flex gap-2 border-b border-black/5 pb-3">
      {visibleTabs.map((tab) => {
        const isSelected = selectedTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: isSelected ? TEXT_COLOR : "#FFFFFF",
              color: isSelected ? "#FFFFFF" : TEXT_COLOR,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
