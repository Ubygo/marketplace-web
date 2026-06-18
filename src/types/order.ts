export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "IN_REVIEW"
  | "NEED_CHANGES"
  | "UPCOMING"
  | "REFUNDED";

export interface OrderVendor {
  id: string;
  name?: string;
  description?: string | null;
  phoneNumber?: string | null;
  photo?: string | null;
  images?: { url: string; order: number }[];
  vendorImages?: { url: string; order: number }[];
}

export interface OrderServiceImage {
  url: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  orderStatus?: OrderStatus;
  scheduledAt?: string | null;
  scheduledDuration?: number | null;
  createdAt?: string;
  serviceName?: string | Record<string, string>;
  serviceDescription?: string | Record<string, string>;
  serviceType?: string;
  bookingNotes?: string | null;
  hasReview?: boolean;
  guestUserId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string | null;
    image?: string | null;
  };
  vendor?: OrderVendor;
  service?: {
    id: string;
    name?: string | Record<string, string>;
    serviceType?: string;
    category?: { name?: string | Record<string, string> };
  };
  serviceImage?: OrderServiceImage;
  metadata?: {
    service?: { name?: string; description?: string };
    vendor?: { phoneNumber?: string };
  };
  paymentRequest?: {
    amount: number;
    currency: string;
  };
}
