export interface ServiceImage {
  id: string;
  url: string;
  order: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  categoryId: string;
  visible: boolean;
  vendorId: string;
  serviceType?: string;
  bookingLocationType?: string;
  actionRadiusKm?: number | null;
  locationId?: string;
  duration?: number;
  durationMetric?: string;
  paymentType?: string;
  minBookingNoticeMinutes?: number | null;
  bookingIntervalMinutes?: number | null;
  images?: ServiceImage[];
  serviceImages?: ServiceImage[];
}

export interface ServiceNewLocation {
  name?: string;
  street: string;
  city: string;
  zipcode?: string;
  country: string;
  lng: number;
  lat: number;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number | null;
  currency: string;
  serviceType: string;
  duration?: number | null;
  durationMetric?: string;
  categoryId: string;
  paymentType: string;
  visible: boolean;
  bookingLocationType?: string;
  actionRadiusKm?: number | null;
  locationId?: string;
  minBookingNoticeMinutes?: number | null;
  bookingIntervalMinutes?: number | null;
  newLocation?: ServiceNewLocation;
  userId?: string;
}

export interface PaginatedServicesResponse {
  data: Service[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
