export interface Dish {
  id: number;
  name: string;
  price: number;
  restaurantId: number;
  image?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  dishes: Dish[];
  image?: string;
}

export interface Delivery {
  id: number;
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
}

export interface AppUser {
  email: string;
  password: string;
  isAdmin: boolean;
  name?: string;
  address?: string;
  phone?: string;
}