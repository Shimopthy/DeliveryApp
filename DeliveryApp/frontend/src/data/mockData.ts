import {
  Restaurant,
  Delivery,
  AppUser
} from "../types";


import imgElTablon from "../assets/images/restaurantes/eltablon.jpg";
import imgValucho from "../assets/images/restaurantes/valucho.png";
import imgShimaya from "../assets/images/restaurantes/shimaya.png";

import imgLomoSaltado from "../assets/images/platos/lomosaltado.jpg";
import imgCeviche from "../assets/images/platos/ceviche.jpg";
import imgPolloBrasa from "../assets/images/platos/polloalabrasa.png";
import imgPizza from "../assets/images/platos/pizza.jpg";
import imgPasta from "../assets/images/platos/pastacarbonara.png";
import imgEnsalada from "../assets/images/platos/ensaladacesar.jpg";
import imgSushi from "../assets/images/platos/sushiroll.jpg";
import imgRamen from "../assets/images/platos/ramentonkotsu.jpg";
import imgGyoza from "../assets/images/platos/gyoza.jpg";


export const initialRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "El Tablon",
    address: "Av. Perú 123",
    image: imgElTablon,
    dishes: [
      {
        id: 1,
        name: "Lomo Saltado",
        price: 18,
        restaurantId: 1,
        image: imgLomoSaltado
      },
      {
        id: 2,
        name: "Ceviche Clásico",
        price: 14,
        restaurantId: 1,
        image: imgCeviche
      },
      {
        id: 3,
        name: "Pollo a la Brasa",
        price: 12,
        restaurantId: 1,
        image: imgPolloBrasa
      }
    ]
  },

  {
    id: 2,
    name: "Valucho",
    address: "Av. La Marina 456",
    image: imgValucho,
    dishes: [
      {
        id: 4,
        name: "Pizza Napolitana",
        price: 16,
        restaurantId: 2,
        image: imgPizza
      },
      {
        id: 5,
        name: "Pasta Carbonara",
        price: 20,
        restaurantId: 2,
        image: imgPasta
      },
      {
        id: 6,
        name: "Ensalada César",
        price: 15,
        restaurantId: 2,
        image: imgEnsalada
      }
    ]
  },

  {
    id: 3,
    name: "Shimaya",
    address: "Calle Bolognesi 789",
    image: imgShimaya,
    dishes: [
      {
        id: 7,
        name: "Sushi Roll",
        price: 22,
        restaurantId: 3,
        image: imgSushi
      },
      {
        id: 8,
        name: "Ramen Tonkotsu",
        price: 18,
        restaurantId: 3,
        image: imgRamen
      },
      {
        id: 9,
        name: "Gyoza",
        price: 25,
        restaurantId: 3,
        image: imgGyoza
      }
    ]
  }
];


export const mockDeliveryPeople: Delivery[] = [
  {
    id: 1,
    name: "Carlos Quispe",
    phone: "+51 987 654 321",
    rating: 4.8,
    vehicle: "Moto Honda Wave"
  }
];


export const seedUsers: AppUser[] = [
  {
    email: "admin@deliveryapp.com",
    password: "admin123",
    isAdmin: true,
    name: "Administrador"
  }
];


export const carouselSlides = [
  {
    img: "...",
    badge: "20% DESCUENTO",
    title: "¡Pizza para todos!",
    sub: "Solo hoy en Valucho",
    accent: "from-orange-500/80 to-red-600/80"
  }
];