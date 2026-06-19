export interface Location {
  id: string;
  name?: string;
  street: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  zipcode?: string;
  vendorId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocationRequest {
  name?: string;
  street: string;
  city: string;
  country: string;
  zipcode?: string;
  lat: number;
  lng: number;
  vendorId?: string;
  userId?: string;
  ownerType: "vendor" | "user";
}

export type UpdateLocationRequest = Partial<
  Omit<CreateLocationRequest, "ownerType">
>;
