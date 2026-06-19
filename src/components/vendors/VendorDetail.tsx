"use client";

import VendorAboutTab from "@/components/vendors/VendorAboutTab";
import VendorBookingMobileBar from "@/components/vendors/VendorBookingMobileBar";
import VendorBookingSidebar from "@/components/vendors/VendorBookingSidebar";
import VendorDetailHeader from "@/components/vendors/VendorDetailHeader";
import VendorDetailTabs, {
  type VendorDetailTab,
} from "@/components/vendors/VendorDetailTabs";
import VendorGallery from "@/components/vendors/VendorGallery";
import VendorGalleryDesktop from "@/components/vendors/VendorGalleryDesktop";
import VendorGalleryTab from "@/components/vendors/VendorGalleryTab";
import VendorReviewsSection from "@/components/vendors/VendorReviewsSection";
import VendorServicesTab from "@/components/vendors/VendorServicesTab";
import { getVendorPageGalleryImages } from "@/lib/vendor-display";
import type { Category } from "@/types/category";
import type { Service } from "@/types/service";
import type { Vendor } from "@/types/vendor";
import { useEffect, useMemo, useState } from "react";

interface VendorDetailProps {
  vendor: Vendor;
  services: Service[];
  categories: Category[];
  currency: string;
  tenantId: string;
  initialServiceId?: string;
}

function getInitialServiceId(
  services: Service[],
  initialServiceId?: string,
): string | null {
  if (!services.length) {
    return null;
  }

  if (
    initialServiceId &&
    services.some((service) => service.id === initialServiceId)
  ) {
    return initialServiceId;
  }

  return services[0].id;
}

export default function VendorDetail({
  vendor,
  services,
  categories,
  currency,
  tenantId,
  initialServiceId,
}: VendorDetailProps) {
  const hasServices = services.length > 0;
  const hasGalleryImages = vendor.images.length > 0;

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(() =>
    getInitialServiceId(services, initialServiceId),
  );

  const galleryImages = useMemo(
    () => getVendorPageGalleryImages(vendor, services, selectedServiceId),
    [vendor, services, selectedServiceId],
  );

  const [selectedTab, setSelectedTab] = useState<VendorDetailTab>(() =>
    initialServiceId && hasServices ? "services" : "about",
  );

  useEffect(() => {
    if (!hasServices && selectedTab === "services") {
      setSelectedTab("about");
    }
  }, [hasServices, selectedTab]);

  useEffect(() => {
    if (!hasGalleryImages && selectedTab === "gallery") {
      setSelectedTab("about");
    }
  }, [hasGalleryImages, selectedTab]);

  useEffect(() => {
    const nextServiceId = getInitialServiceId(services, initialServiceId);
    setSelectedServiceId(nextServiceId);
  }, [services, initialServiceId]);

  useEffect(() => {
    if (!initialServiceId || !hasServices) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById("vendor-services")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [initialServiceId, hasServices]);

  return (
    <main className="flex min-h-full flex-1 flex-col pb-24 lg:pb-10">
      <div className="lg:hidden">
        <div className="-mx-4 flex flex-col gap-4 px-4 pb-2 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
          <VendorDetailHeader vendor={vendor} />

          <VendorGallery images={galleryImages} vendorName={vendor.name} />
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
          <VendorDetailTabs
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            showServicesTab={hasServices}
            showGalleryTab={hasGalleryImages}
          />

          <div className="mt-4">
            {selectedTab === "about" ? <VendorAboutTab vendor={vendor} /> : null}
            {selectedTab === "services" ? (
              <VendorServicesTab
                services={services}
                categories={categories}
                currency={currency}
                selectedServiceId={selectedServiceId}
                onSelectService={setSelectedServiceId}
              />
            ) : null}
            {selectedTab === "gallery" ? (
              <VendorGalleryTab images={vendor.images} />
            ) : null}
            {selectedTab === "reviews" ? (
              <VendorReviewsSection
                vendorId={vendor.id}
                tenantId={tenantId}
                averageRating={vendor.averageRating}
                reviewCount={vendor.reviewCount}
                showTitle={false}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 lg:pt-6">
        <div className="flex min-w-0 flex-col gap-6">
          <VendorDetailHeader vendor={vendor} variant="desktop" />

          <VendorGalleryDesktop
            images={galleryImages}
            vendorName={vendor.name}
          />

          <VendorAboutTab vendor={vendor} showSectionTitle inCard />

          <VendorReviewsSection
            vendorId={vendor.id}
            tenantId={tenantId}
            averageRating={vendor.averageRating}
            reviewCount={vendor.reviewCount}
            inCard
          />
        </div>

        <aside className="sticky top-6 h-fit">
          <VendorBookingSidebar
            vendor={vendor}
            services={services}
            currency={currency}
            selectedServiceId={selectedServiceId}
            onSelectService={setSelectedServiceId}
          />
        </aside>
      </div>

      {hasServices ? (
        <VendorBookingMobileBar
          vendorId={vendor.id}
          services={services}
          currency={currency}
          selectedServiceId={selectedServiceId}
        />
      ) : null}
    </main>
  );
}
