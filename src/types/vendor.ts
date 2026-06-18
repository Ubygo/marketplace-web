export interface VendorImage {
  id: string;
  url: string;
  order: number;
}

export interface VendorLocation {
  street?: string;
  city?: string;
  zipcode?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface VendorAvailabilitySlot {
  weekDay: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface VendorAvailability {
  timezone: string;
  slots: VendorAvailabilitySlot[];
}

export type StripeRequirementsResolution =
  | "account_onboarding"
  | "account_update"
  | "pending_verification"
  | "none";

export interface Vendor {
  id: string;
  name: string;
  categoryId?: string;
  description?: string;
  phoneNumber?: string;
  photo?: string | null;
  locationId?: string;
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  ratingCount?: number | null;
  vendorImages: VendorImage[];
  images: VendorImage[];
  location?: VendorLocation;
  availability?: VendorAvailability;
  visible: boolean;
  approved?: boolean;
  status: "active" | "inactive";
  stripeAccountStatus?: StripeRequirementsResolution | string;
  iban?: string | null;
  bankAccountHolderName?: string | null;
  googleCalendarEmail?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingStep {
  action: string;
  done: boolean;
}

export interface OnboardingStepsResponse {
  steps: OnboardingStep[];
}

export type VendorStatsPeriod =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "custom";

export interface VendorTopServiceStat {
  serviceId?: string;
  name: string;
  orderCount: number;
  revenue: number;
}

export interface VendorStats {
  orderCount: number;
  cancelledOrders?: number;
  revenue: number;
  currency?: string;
  period?: {
    start: string;
    end: string;
  };
  topServices?: VendorTopServiceStat[];
}

export interface VendorCardData {
  id: string;
  vendorName: string;
  avatarUrl: string;
  galleryImages: string[];
  serviceTitle: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  categoryId?: string;
}
