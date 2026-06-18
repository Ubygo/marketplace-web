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
  duration?: number;
  durationMetric?: string;
  images?: ServiceImage[];
  serviceImages?: ServiceImage[];
}
