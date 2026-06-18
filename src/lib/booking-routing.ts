import type { Service } from "@/types/service";

export function serviceNeedsSlotPicker(service: Pick<Service, "serviceType" | "bookingLocationType">): boolean {
  return (
    service.serviceType === "BOOKING" &&
    (service.bookingLocationType === "AT_STORE" ||
      service.bookingLocationType === "AT_CLIENT")
  );
}
