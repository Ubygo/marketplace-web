"use client";

import VendorAboutTab from "@/components/vendors/VendorAboutTab";
import VendorBookingMobileBar from "@/components/vendors/VendorBookingMobileBar";
import VendorBookingOverlay from "@/components/vendors/booking/VendorBookingOverlay";
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
import { useBookingFlow } from "@/hooks/useBookingFlow";
import { getVendorPageGalleryImages } from "@/lib/vendor-display";
import type { Category } from "@/types/category";
import type { Service } from "@/types/service";
import type { Vendor } from "@/types/vendor";
import { useCallback, useEffect, useMemo, useState } from "react";

interface VendorDetailProps {
  vendor: Vendor;
  services: Service[];
  categories: Category[];
  currency: string;
  tenantId: string;
  initialServiceId?: string;
  initialBookMode?: boolean;
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
  initialBookMode = false,
}: VendorDetailProps) {
  const hasServices = services.length > 0;
  const hasGalleryImages = vendor.images.length > 0;

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(() =>
    getInitialServiceId(services, initialServiceId),
  );
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(() =>
    initialBookMode && initialServiceId ? initialServiceId : null,
  );

  const handleStartSlotBooking = useCallback((serviceId: string) => {
    setBookingServiceId(serviceId);
    setSelectedServiceId(serviceId);
  }, []);

  const handleExitBooking = useCallback(() => {
    setBookingServiceId(null);
  }, []);

  const handleSelectService = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setBookingServiceId(null);
  }, []);

  const { handleBook, isLoading, isStripeEnabled, paymentModal } =
    useBookingFlow(vendor.id, {
      onStartSlotBooking: handleStartSlotBooking,
    });

  const galleryImages = useMemo(
    () => getVendorPageGalleryImages(vendor, services, selectedServiceId),
    [vendor, services, selectedServiceId],
  );

  const [selectedTab, setSelectedTab] = useState<VendorDetailTab>(() =>
    initialServiceId && hasServices ? "services" : "about",
  );

  useEffect(() => {
    console.log("[VendorDetail] disponibilités vendeur", {
      vendorId: vendor.id,
      vendorName: vendor.name,
      availability: vendor.availability,
      slots: vendor.availability?.slots ?? [],
      activeSlots:
        vendor.availability?.slots?.filter((slot) => slot.active) ?? [],
    });
  }, [vendor]);

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
    if (initialBookMode && initialServiceId) {
      setBookingServiceId(initialServiceId);
      setSelectedServiceId(initialServiceId);
    }
  }, [initialBookMode, initialServiceId]);

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
                onSelectService={handleSelectService}
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
            bookingServiceId={bookingServiceId}
            onSelectService={handleSelectService}
            onExitBooking={handleExitBooking}
            onBook={(serviceId) => void handleBook(serviceId)}
            isBookingLoading={isLoading}
            isStripeEnabled={isStripeEnabled}
            directPaymentModal={paymentModal}
          />
        </aside>
      </div>

      {hasServices && !bookingServiceId ? (
        <VendorBookingMobileBar
          services={services}
          currency={currency}
          selectedServiceId={selectedServiceId}
          onBook={(serviceId) => void handleBook(serviceId)}
          isBookingLoading={isLoading}
          isStripeEnabled={isStripeEnabled}
        />
      ) : null}

      {bookingServiceId ? (
        <VendorBookingOverlay
          vendor={vendor}
          services={services}
          currency={currency}
          bookingServiceId={bookingServiceId}
          onExitBooking={handleExitBooking}
        />
      ) : null}

      {!bookingServiceId ? (
        <div className="lg:hidden">{paymentModal}</div>
      ) : null}
    </main>
  );
}
