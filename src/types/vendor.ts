export interface VendorImage {
  id: string;
  url: string;
  order: number;
}

export interface Vendor {
  id: string;
  name: string;
  description?: string;
  photo?: string | null;
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  ratingCount?: number | null;
  vendorImages: VendorImage[];
  images: VendorImage[];
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
