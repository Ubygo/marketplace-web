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

export interface Vendor {
  id: string;
  name: string;
  description?: string;
  phoneNumber?: string;
  photo?: string | null;
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  ratingCount?: number | null;
  vendorImages: VendorImage[];
  images: VendorImage[];
  location?: VendorLocation;
  availability?: VendorAvailability;
  visible: boolean;
  status: "active" | "inactive";
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
