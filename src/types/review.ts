export interface ReviewUser {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

export interface Review {
  id: string;
  orderId: string;
  userId?: string;
  vendorId?: string;
  serviceId?: string;
  rate: number;
  comment?: string;
  serviceName?: string;
  user?: ReviewUser;
  createdAt: string;
  updatedAt?: string;
}
