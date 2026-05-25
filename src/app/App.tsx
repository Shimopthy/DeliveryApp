import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, User, Utensils, ArrowLeft, Plus, Minus, Trash2,
  Search, MapPin, Phone, Mail, Clock, Truck, CheckCircle2, Edit2,
  X, Moon, Sun, LogOut, Settings, UserCircle, ChevronRight,
  Package, Star, Bike, ChevronLeft, CreditCard, Banknote, Smartphone,
  AlertTriangle, MessageSquare, Hash
} from "lucide-react";
import { toast, Toaster } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";

// ─── Imports de imágenes ────────────────────────────────────────────────────────
// Imágenes de restaurantes
import imgElTablon from "./imagenes/restaurantes/eltablon.jpg";
import imgValucho from "./imagenes/restaurantes/valucho.png";
import imgShimaya from "./imagenes/restaurantes/shimaya.png";

// Imágenes de platos
import imgLomoSaltado from "./imagenes/platos/lomosaltado.jpg";
import imgCeviche from "./imagenes/platos/ceviche.jpg";
import imgPolloBrasa from "./imagenes/platos/polloalabrasa.png";
import imgPizza from "./imagenes/platos/pizza.jpg";
import imgPasta from "./imagenes/platos/pastacarbonara.png";
import imgEnsalada from "./imagenes/platos/ensaladacesar.jpg";
import imgSushi from "./imagenes/platos/sushiroll.jpg";
import imgRamen from "./imagenes/platos/ramentonkotsu.jpg";
import imgGyoza from "./imagenes/platos/gyoza.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dish {
  id: number;
  name: string;
  price: number;
  restaurantId: number;
  image?: string;
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  dishes: Dish[];
  image?: string;
}

interface CartItem {
  dish: Dish;
  quantity: number;
  restaurantName: string;
}

interface AppUser {
  email: string;
  password: string;
  isAdmin: boolean;
  name?: string;
  address?: string;
  phone?: string;
}

interface Delivery {
  id: number;
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
}

interface Order {
  id: number;
  restaurantName: string;
  address: string;
  total: number;
  items: CartItem[];
  status: "received" | "preparing" | "on-way" | "delivered";
  estimatedTime: number;
  deliveryPerson?: Delivery;
}

type PaymentMethod = "yape" | "plin" | "card" | "cash";
type Page = "home" | "restaurant" | "cart" | "checkout" | "order-status" | "admin";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const initialRestaurants: Restaurant[] = [
  {
    id: 1, name: "El Tablon", address: "Av. Perú 123", image: imgElTablon,
    dishes: [
      { id: 1, name: "Lomo Saltado", price: 18.00, restaurantId: 1, image: imgLomoSaltado },
      { id: 2, name: "Ceviche Clásico", price: 14.00, restaurantId: 1, image: imgCeviche },     
      { id: 3, name: "Pollo a la Brasa", price: 12.00, restaurantId: 1, image: imgPolloBrasa },  
    ]
  },
  {
    id: 2, name: "Valucho", address: "Av. La Marina 456", image: imgValucho,
    dishes: [
      { id: 4, name: "Pizza Napolitana", price: 16.00, restaurantId: 2, image: imgPizza },  
      { id: 5, name: "Pasta Carbonara", price: 20.00, restaurantId: 2, image: imgPasta },   
      { id: 6, name: "Ensalada César", price: 15.00, restaurantId: 2, image: imgEnsalada },  
    ]
  },
  {
    id: 3, name: "Shimaya", address: "Calle Bolognesi 789", image: imgShimaya,
    dishes: [
      { id: 7, name: "Sushi Roll", price: 22.00, restaurantId: 3, image: imgSushi }, 
      { id: 8, name: "Ramen Tonkotsu", price: 18.00, restaurantId: 3, image: imgRamen }, 
      { id: 9, name: "Gyoza", price: 25.00, restaurantId: 3, image: imgGyoza },    
    ]
  },
];

const mockDeliveryPeople: Delivery[] = [
  { id: 1, name: "Carlos Quispe", phone: "+51 987 654 321", rating: 4.8, vehicle: "Moto Honda Wave" },
  { id: 2, name: "Miguel Torres", phone: "+51 976 543 210", rating: 4.9, vehicle: "Bicicleta eléctrica" },
  { id: 3, name: "Luis Mamani", phone: "+51 965 432 109", rating: 4.7, vehicle: "Moto Yamaha" },
];

const seedUsers: AppUser[] = [
  { email: "admin@deliveryapp.com", password: "admin123", isAdmin: true, name: "Administrador" },
  { email: "user@test.com", password: "user123", isAdmin: false, name: "Cliente Demo", address: "Av. Ejército 100, Arequipa", phone: "+51 954 100 200" },
];

const carouselSlides = [
  {
    img: "https://images.unsplash.com/photo-1589010588553-46e8e7c21788?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    badge: "20% DESCUENTO",
    title: "¡Pizza para todos!",
    sub: "Solo hoy en Restaurante B. Usa el código PIZZA20",
    accent: "from-orange-500/80 to-red-600/80",
  },
  {
    img: "https://images.unsplash.com/photo-1695653423034-d15c9f3d1328?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    badge: "DELIVERY GRATIS",
    title: "Primeros 3 pedidos",
    sub: "Sin mínimo de compra. Regístrate y disfruta.",
    accent: "from-primary/80 to-orange-600/80",
  },
  {
    img: "https://images.unsplash.com/photo-1672067993158-e144b3a9143f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    badge: "NUEVO",
    title: "Sushi & Ramen",
    sub: "Restaurante C ahora disponible en tu zona.",
    accent: "from-indigo-600/80 to-blue-500/80",
  },
  {
    img: "https://images.unsplash.com/photo-1511495366194-31561af5b3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    badge: "PROMOCIÓN",
    title: "Lunes de ahorro",
    sub: "10% off en todos los pedidos cada lunes.",
    accent: "from-green-600/80 to-teal-500/80",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = "w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground";

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [deliveryPeople, setDeliveryPeople] = useState<Delivery[]>(mockDeliveryPeople);
  const [users, setUsers] = useState<AppUser[]>(seedUsers);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("yape");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminAction, setAdminAction] = useState<"add" | "edit">("add");
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [adminDialogType, setAdminDialogType] = useState<"restaurant" | "dish" | "delivery">("restaurant");
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);
  const deliveryFee = 5.00;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Order status progression
  useEffect(() => {
    if (!currentOrder || currentOrder.status === "delivered") return;
    const statuses: Order["status"][] = ["received", "preparing", "on-way", "delivered"];
    const idx = statuses.indexOf(currentOrder.status);
    const t = setTimeout(() => {
      setCurrentOrder(prev => prev ? { ...prev, status: statuses[idx + 1] } : prev);
    }, 5000);
    return () => clearTimeout(t);
  }, [currentOrder]);

  // ─── Cart helpers ────────────────────────────────────────────────────────────

  const addToCart = (dish: Dish, restaurantName: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.dish.id === dish.id);
      return ex
        ? prev.map(i => i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { dish, quantity: 1, restaurantName }];
    });
    toast.success(`${dish.name} agregado`, { duration: 1800, position: "bottom-center" });
  };

  const updateQty = (dishId: number, delta: number) => {
    setCart(prev => prev.map(i => i.dish.id === dishId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  // ─── Auth ────────────────────────────────────────────────────────────────────

  const handleLogin = (email: string, password: string, registerName?: string): boolean => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setCurrentUser(found);
      setShowLoginDialog(false);
      toast.success(`¡Bienvenido, ${found.name || found.email}!`);
      return true;
    }
    if (registerName) {
      const nu: AppUser = { email, password, isAdmin: false, name: registerName };
      setUsers(p => [...p, nu]);
      setCurrentUser(nu);
      setShowLoginDialog(false);
      toast.success(`¡Cuenta creada! Bienvenido, ${registerName}!`);
      return true;
    }
    // auto-register unknown logins as regular user for demo
    if (!users.find(u => u.email === email)) {
      const au: AppUser = { email, password, isAdmin: false, name: email.split("@")[0] };
      setUsers(p => [...p, au]);
      setCurrentUser(au);
      setShowLoginDialog(false);
      toast.success("¡Bienvenido!");
      return true;
    }
    toast.error("Contraseña incorrecta");
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowUserMenu(false);
    setPage("home");
    toast.success("Sesión cerrada");
  };

  // ─── Checkout ────────────────────────────────────────────────────────────────

  const handleCheckout = () => {
    if (!currentUser) { setShowLoginDialog(true); return; }
    if (!deliveryAddress) { toast.error("Ingresa la dirección de entrega"); return; }
    const dp = mockDeliveryPeople[Math.floor(Math.random() * mockDeliveryPeople.length)];
    const order: Order = {
      id: Math.floor(Math.random() * 90000) + 10000,
      restaurantName: cart[0]?.restaurantName || "",
      address: deliveryAddress,
      total,
      items: [...cart],
      status: "received",
      estimatedTime: 30,
      deliveryPerson: dp,
    };
    setCurrentOrder(order);
    setCart([]);
    setPage("order-status");
    toast.success("¡Pedido confirmado!");
  };

  // ─── Admin helpers ───────────────────────────────────────────────────────────

  const addR = (name: string, address: string) => {
    setRestaurants(p => [...p, { id: Math.max(...p.map(r => r.id)) + 1, name, address, dishes: [] }]);
    toast.success("Restaurante agregado");
  };
  const editR = (id: number, name: string, address: string) => {
    setRestaurants(p => p.map(r => r.id === id ? { ...r, name, address } : r));
    toast.success("Restaurante actualizado");
  };
  const delR = (id: number) => { setRestaurants(p => p.filter(r => r.id !== id)); toast.success("Eliminado"); };

  const addD = (rId: number, name: string, price: number) => {
    setRestaurants(p => p.map(r => r.id === rId ? {
      ...r, dishes: [...r.dishes, { id: Math.max(...p.flatMap(x => x.dishes.map(d => d.id)), 0) + 1, name, price, restaurantId: rId }]
    } : r));
    toast.success("Plato agregado");
  };
  const editD = (rId: number, dId: number, name: string, price: number) => {
    setRestaurants(p => p.map(r => r.id === rId ? { ...r, dishes: r.dishes.map(d => d.id === dId ? { ...d, name, price } : d) } : r));
    toast.success("Plato actualizado");
  };
  const delD = (rId: number, dId: number) => {
    setRestaurants(p => p.map(r => r.id === rId ? { ...r, dishes: r.dishes.filter(d => d.id !== dId) } : r));
    toast.success("Eliminado");
  };

  const addDel = (name: string, phone: string, vehicle: string) => {
    setDeliveryPeople(p => [...p, { id: Math.max(...p.map(d => d.id), 0) + 1, name, phone, vehicle, rating: 5.0 }]);
    toast.success("Repartidor agregado");
  };
  const editDel = (id: number, name: string, phone: string, vehicle: string) => {
    setDeliveryPeople(p => p.map(d => d.id === id ? { ...d, name, phone, vehicle } : d));
    toast.success("Repartidor actualizado");
  };
  const delDel = (id: number) => { setDeliveryPeople(p => p.filter(d => d.id !== id)); toast.success("Eliminado"); };

  const updateProfile = (name: string, address: string, phone: string) => {
    if (!currentUser) return;
    const u = { ...currentUser, name, address, phone };
    setCurrentUser(u);
    setUsers(p => p.map(x => x.email === currentUser.email ? u : x));
    toast.success("Perfil actualizado");
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      {/* ── Header ── */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => { setPage("home"); setSelectedRestaurant(null); }} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-2 rounded-lg"><Utensils className="w-6 h-6 text-white" /></div>
            <span className="font-semibold text-lg">DeliveryApp</span>
          </button>

          <div className="flex items-center gap-1">
            <button onClick={() => setIsDark(!isDark)} className="p-2 hover:bg-muted rounded-lg transition-colors" title={isDark ? "Modo claro" : "Modo oscuro"}>
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {page !== "admin" && (
              <button onClick={() => setPage("cart")} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">{cartCount}</span>
                )}
              </button>
            )}

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => currentUser ? setShowUserMenu(!showUserMenu) : setShowLoginDialog(true)}
                className={`p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5 ${currentUser ? "text-primary" : ""}`}
              >
                <User className="w-6 h-6" />
                {currentUser && <span className="text-sm font-medium hidden sm:block max-w-[90px] truncate">{currentUser.name || currentUser.email}</span>}
              </button>

              {showUserMenu && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-58 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-muted/40 border-b border-border">
                    <p className="font-semibold text-sm truncate">{currentUser.name || currentUser.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                    {currentUser.isAdmin && <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Administrador</span>}
                  </div>
                  {currentUser.isAdmin
                    ? <button onClick={() => { setPage("admin"); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm">
                      <Settings className="w-4 h-4 text-primary" />Panel de Administración<ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </button>
                    : <button onClick={() => { setShowProfileDialog(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm">
                      <UserCircle className="w-4 h-4 text-primary" />Mi Perfil<ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </button>
                  }
                  <div className="border-t border-border">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 text-destructive transition-colors text-sm">
                      <LogOut className="w-4 h-4" />Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Home ── */}
      {page === "home" && (
        <div>
          <HeroCarousel slides={carouselSlides} />

          <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Search */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar restaurantes, comida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: <Utensils className="w-6 h-6 text-primary" />, title: "Variedad", sub: "Más de 100 restaurantes" },
                { icon: <Clock className="w-6 h-6 text-primary" />, title: "Rapidez", sub: "Entrega en 30-45 min" },
                { icon: <Truck className="w-6 h-6 text-primary" />, title: "Seguridad", sub: "Seguimiento en tiempo real" },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-4 bg-card rounded-xl p-5 border border-border shadow-sm">
                  <div className="bg-accent p-3 rounded-lg flex-shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-semibold mb-0.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Restaurants */}
            <h2 className="text-2xl font-semibold mb-6">Restaurantes disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants
                .filter(r => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(r => (
                  <div key={r.id} className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
                    <div className="h-32 w-full overflow-hidden bg-accent">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="w-14 h-14 text-primary opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{r.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{r.address}</p>
                      <p className="text-xs text-muted-foreground mb-4">{r.dishes.length} platos disponibles</p>
                      <button onClick={() => { setSelectedRestaurant(r); setPage("restaurant"); }} className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                        VER MENÚ
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-card border-t border-border mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold mb-3">Sobre DeliveryApp</h3>
                  <p className="text-sm text-muted-foreground">Tu plataforma de delivery favorita en Arequipa. Comida deliciosa a tu puerta en minutos.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Contacto</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>+51 954 123 456</span></div>
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>soporte@deliveryapp.com</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>Arequipa, Perú</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">¿Necesitas ayuda?</h3>
                  <p className="text-sm text-muted-foreground mb-3">Si tienes algún problema con tu pedido, estamos aquí para ayudarte.</p>
                  <button onClick={() => setShowReportDialog(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                    Reportar un problema
                  </button>
                </div>
              </div>
              <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">© 2026 DeliveryApp. Todos los derechos reservados.</div>
            </div>
          </footer>
        </div>
      )}

      {/* ── Restaurant ── */}
      {page === "restaurant" && selectedRestaurant && (
        <div>
          <div className="border-b border-border bg-card">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <button onClick={() => setPage("home")} className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />Volver
              </button>
              <h1 className="text-3xl font-bold mb-1">{selectedRestaurant.name}</h1>
              <p className="text-muted-foreground">{selectedRestaurant.address}</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-6">Menú</h2>
            <div className="space-y-4">
              {selectedRestaurant.dishes.map(dish => {
                const ci = cart.find(i => i.dish.id === dish.id);
                return (
                  <div key={dish.id} className="bg-card rounded-xl p-4 flex items-center gap-4 shadow-sm border border-border">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="w-8 h-8 text-primary opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{dish.name}</h3>
                      <p className="text-primary font-medium">S/. {dish.price.toFixed(2)}</p>
                    </div>
                    {ci ? (
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQty(dish.id, -1)} className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                        <span className="font-medium w-6 text-center">{ci.quantity}</span>
                        <button onClick={() => updateQty(dish.id, 1)} className="w-8 h-8 rounded-full bg-primary text-white hover:bg-orange-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(dish, selectedRestaurant.name)} className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                        Agregar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setPage("cart")} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-4 rounded-full font-medium shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />VER CARRITO ({cartCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Cart ── */}
      {page === "cart" && (
        <div>
          <div className="border-b border-border bg-card">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <button onClick={() => selectedRestaurant ? setPage("restaurant") : setPage("home")} className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />Volver
              </button>
              <h1 className="text-3xl font-bold">Carrito de Compras</h1>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-4 py-8">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
                <p className="text-muted-foreground mb-6">Agrega algunos platos para continuar</p>
                <button onClick={() => setPage("home")} className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors">Ver restaurantes</button>
              </div>
            ) : (
              <>
                <div className="bg-card rounded-xl p-6 mb-6 border border-border">
                  {cart.map(item => (
                    <div key={item.dish.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.dish.name}</h3>
                        <p className="text-sm text-muted-foreground">S/. {item.dish.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQty(item.dish.id, -1)} className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.dish.id, 1)} className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => setCart(c => c.filter(i => i.dish.id !== item.dish.id))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-card rounded-xl p-6 mb-6 border border-border space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">S/. {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-medium">S/. {deliveryFee.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span><span className="text-primary">S/. {total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => setPage("checkout")} className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-orange-600 transition-colors">Continuar con la compra</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout ── */}
      {page === "checkout" && (
        <div>
          <div className="border-b border-border bg-card">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <button onClick={() => setPage("cart")} className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />Volver al carrito
              </button>
              <h1 className="text-3xl font-bold">Finalizar Pedido</h1>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {!currentUser && (
              <div className="bg-accent border border-primary/20 rounded-xl p-5 flex items-center justify-between gap-4">
                <p className="text-sm"><strong>Inicia sesión</strong> para aplicar descuentos y guardar tu historial.</p>
                <button onClick={() => setShowLoginDialog(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors whitespace-nowrap">INICIAR SESIÓN</button>
              </div>
            )}

            {/* Payment */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {([
                  { value: "yape", label: "Yape", icon: <Smartphone className="w-5 h-5" />, color: "text-purple-600" },
                  { value: "plin", label: "Plin", icon: <Smartphone className="w-5 h-5" />, color: "text-blue-500" },
                  { value: "card", label: "Tarjeta", icon: <CreditCard className="w-5 h-5" />, color: "text-foreground" },
                  { value: "cash", label: "Efectivo", icon: <Banknote className="w-5 h-5" />, color: "text-green-600" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}
                  >
                    <span className={opt.color}>{opt.icon}</span>
                    <span className={`font-medium text-sm ${paymentMethod === opt.value ? "text-primary" : ""}`}>{opt.label}</span>
                    {paymentMethod === opt.value && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>

              {/* Yape QR */}
              {paymentMethod === "yape" && (
                <div className="border border-border rounded-xl p-5 bg-muted/30">
                  <p className="text-sm font-medium mb-3 text-center">Escanea el QR con la app de Yape</p>
                  <div className="flex justify-center mb-3">
                    <YapeQR amount={total} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Número Yape: <strong>+51 954 123 456</strong> · Titular: DeliveryApp SAC</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">Monto a pagar: <strong className="text-primary">S/. {total.toFixed(2)}</strong></p>
                </div>
              )}

              {/* Plin QR */}
              {paymentMethod === "plin" && (
                <div className="border border-border rounded-xl p-5 bg-muted/30">
                  <p className="text-sm font-medium mb-3 text-center">Escanea el QR con la app de Plin</p>
                  <div className="flex justify-center mb-3">
                    <PlinQR amount={total} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Número Plin: <strong>+51 954 123 456</strong> · BCP / BBVA / Scotiabank</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">Monto a pagar: <strong className="text-primary">S/. {total.toFixed(2)}</strong></p>
                </div>
              )}

              {/* Card form */}
              {paymentMethod === "card" && <CardForm />}

              {/* Cash */}
              {paymentMethod === "cash" && (
                <div className="border border-border rounded-xl p-5 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-green-800 dark:text-green-400">Pago en efectivo al repartidor</p>
                      <p className="text-xs text-green-700/70 dark:text-green-500 mt-1">
                        Prepara el monto exacto de <strong>S/. {total.toFixed(2)}</strong>. El repartidor no siempre tendrá cambio disponible.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            {currentUser && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-xl font-semibold mb-4">Dirección de Entrega</h2>
                <input type="text" placeholder="Ej: Av. Ejército 123, Cercado, Arequipa" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={inputCls} />
              </div>
            )}

            {/* Summary */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Resumen</h2>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.dish.id} className="flex justify-between text-sm">
                    <span>{item.dish.name} ×{item.quantity}</span>
                    <span>S/. {(item.dish.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-border text-muted-foreground text-sm"><span>Subtotal</span><span>S/. {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground text-sm"><span>Delivery</span><span>S/. {deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span>Total</span><span className="text-primary">S/. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => currentUser ? handleCheckout() : setShowLoginDialog(true)}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              {currentUser ? "Confirmar Pedido" : "Iniciar Sesión para Continuar"}
            </button>
          </div>
        </div>
      )}

      {/* ── Order Status ── */}
      {page === "order-status" && currentOrder && (
        <div className="min-h-screen bg-background">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary p-2 rounded-lg"><Utensils className="w-6 h-6 text-white" /></div>
              <span className="font-semibold text-xl">DeliveryApp</span>
            </div>

            <div className="bg-card rounded-xl p-6 mb-5 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl font-bold">Pedido #{currentOrder.id}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${currentOrder.status === "delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-primary/10 text-primary"
                  }`}>
                  {currentOrder.status === "received" && "Recibido"}
                  {currentOrder.status === "preparing" && "Preparando"}
                  {currentOrder.status === "on-way" && "En camino"}
                  {currentOrder.status === "delivered" && "Entregado"}
                </span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Restaurante:</strong> {currentOrder.restaurantName}</p>
                <p><strong className="text-foreground">Dirección:</strong> {currentOrder.address}</p>
                <p><strong className="text-foreground">Total:</strong> <span className="text-primary font-semibold">S/. {currentOrder.total.toFixed(2)}</span></p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 mb-5 border border-border shadow-sm">
              <h2 className="font-semibold mb-6">Estado del pedido</h2>
              <div className="relative flex justify-between">
                {(["received", "preparing", "on-way", "delivered"] as const).map((s, idx) => {
                  const labels = ["Recibido", "Preparando", "En camino", "Entregado"];
                  const cur = ["received", "preparing", "on-way", "delivered"].indexOf(currentOrder.status);
                  const active = idx <= cur;
                  return (
                    <div key={s} className="flex flex-col items-center flex-1 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${active ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                        {active ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm">{idx + 1}</span>}
                      </div>
                      <span className={`text-xs text-center leading-tight ${active ? "font-medium" : "text-muted-foreground"}`}>{labels[idx]}</span>
                    </div>
                  );
                })}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-0">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(["received", "preparing", "on-way", "delivered"].indexOf(currentOrder.status) / 3) * 100}%` }} />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">Tiempo estimado: <strong className="text-foreground">{currentOrder.estimatedTime} min</strong></p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowOrderDetail(true)} className="flex-1 bg-card border-2 border-primary text-primary py-4 rounded-xl font-semibold hover:bg-primary/5 transition-colors">VER DETALLE</button>
              <button onClick={() => setPage("home")} className="flex-1 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors">INICIO</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin ── */}
      {page === "admin" && currentUser?.isAdmin && (
        <div className="min-h-screen bg-background">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setPage("home")} className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></button>
              <Utensils className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-semibold">Panel de Administración</h1>
            </div>

            <Tabs.Root defaultValue="restaurants" className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <Tabs.List className="flex border-b border-border overflow-x-auto">
                {[["restaurants", "Restaurantes"], ["dishes", "Platos"], ["delivery", "Repartidores"]].map(([v, l]) => (
                  <Tabs.Trigger key={v} value={v} className="flex-1 min-w-[110px] px-6 py-4 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary hover:bg-muted/50 transition-colors">
                    {l}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.Content value="restaurants" className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Gestionar Restaurantes</h2>
                  <button onClick={() => { setAdminAction("add"); setEditingRestaurant(null); setAdminDialogType("restaurant"); setShowAdminDialog(true); }} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Nuevo</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">Nombre</th>
                      <th className="text-left py-3 px-4 font-medium">Dirección</th>
                      <th className="text-left py-3 px-4 font-medium">Platos</th>
                      <th className="text-right py-3 px-4 font-medium">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {restaurants.map(r => (
                        <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 font-medium">{r.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{r.address}</td>
                          <td className="py-3 px-4 text-muted-foreground">{r.dishes.length}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingRestaurant(r); setAdminAction("edit"); setAdminDialogType("restaurant"); setShowAdminDialog(true); }} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => delR(r.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tabs.Content>

              <Tabs.Content value="dishes" className="p-6">
                <h2 className="text-xl font-semibold mb-6">Gestionar Platos</h2>
                {restaurants.map(r => (
                  <div key={r.id} className="mb-8 last:mb-0">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-base">{r.name}</h3>
                      <button onClick={() => { setEditingRestaurant(r); setEditingDish(null); setAdminAction("add"); setAdminDialogType("dish"); setShowAdminDialog(true); }} className="text-primary text-sm flex items-center gap-1 hover:opacity-70"><Plus className="w-4 h-4" />Agregar plato</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm mb-4">
                        <thead><tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-2 px-4 font-medium">Nombre</th>
                          <th className="text-left py-2 px-4 font-medium">Precio</th>
                          <th className="text-right py-2 px-4 font-medium">Acciones</th>
                        </tr></thead>
                        <tbody>
                          {r.dishes.map(d => (
                            <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                              <td className="py-2 px-4">{d.name}</td>
                              <td className="py-2 px-4 text-muted-foreground">S/. {d.price.toFixed(2)}</td>
                              <td className="py-2 px-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => { setEditingRestaurant(r); setEditingDish(d); setAdminAction("edit"); setAdminDialogType("dish"); setShowAdminDialog(true); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => delD(r.id, d.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {r.dishes.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">Sin platos</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </Tabs.Content>

              <Tabs.Content value="delivery" className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Gestionar Repartidores</h2>
                  <button onClick={() => { setAdminAction("add"); setEditingDelivery(null); setAdminDialogType("delivery"); setShowAdminDialog(true); }} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Nuevo</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">Nombre</th>
                      <th className="text-left py-3 px-4 font-medium">Teléfono</th>
                      <th className="text-left py-3 px-4 font-medium">Vehículo</th>
                      <th className="text-left py-3 px-4 font-medium">Rating</th>
                      <th className="text-right py-3 px-4 font-medium">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {deliveryPeople.map(p => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"><Bike className="w-4 h-4 text-primary" /></div>
                              {p.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{p.phone}</td>
                          <td className="py-3 px-4 text-muted-foreground">{p.vehicle}</td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1 text-yellow-500 font-medium"><Star className="w-3.5 h-3.5 fill-yellow-500" />{p.rating.toFixed(1)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingDelivery(p); setAdminAction("edit"); setAdminDialogType("delivery"); setShowAdminDialog(true); }} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => delDel(p.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      )}

      {/* ── Login Dialog ── */}
      <Dialog.Root open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl w-full max-w-sm z-50 text-foreground overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <div>
                <Dialog.Title className="text-xl font-bold">Iniciar Sesión</Dialog.Title>
                <p className="text-xs text-muted-foreground mt-0.5">Accede a tu cuenta DeliveryApp</p>
              </div>
              <Dialog.Close className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="px-6 py-5">
              <div className="bg-muted/60 rounded-xl p-3 mb-5 text-xs text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">Cuentas de prueba</p>
                <p>Admin: admin@deliveryapp.com / admin123</p>
                <p>Usuario: user@test.com / user123</p>
              </div>
              <LoginForm onLogin={handleLogin} onClose={() => setShowLoginDialog(false)} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Report Dialog ── */}
      <Dialog.Root open={showReportDialog} onOpenChange={setShowReportDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl w-full max-w-md z-50 text-foreground shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
                <div>
                  <Dialog.Title className="text-lg font-bold">Reportar Problema</Dialog.Title>
                  <p className="text-xs text-muted-foreground">Analizaremos tu caso en menos de 24 h</p>
                </div>
              </div>
              <Dialog.Close className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="px-6 py-5">
              <ReportForm onClose={() => setShowReportDialog(false)} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Admin Dialog ── */}
      <Dialog.Root open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl w-full max-w-sm z-50 text-foreground shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <Dialog.Title className="text-lg font-bold">
                {adminDialogType === "restaurant" ? (adminAction === "add" ? "Nuevo Restaurante" : "Editar Restaurante")
                  : adminDialogType === "dish" ? (adminAction === "add" ? "Agregar Plato" : "Editar Plato")
                    : (adminAction === "add" ? "Nuevo Repartidor" : "Editar Repartidor")}
              </Dialog.Title>
              <Dialog.Close className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="px-6 py-5">
              <AdminForm
                action={adminAction}
                type={adminDialogType}
                restaurant={editingRestaurant}
                dish={editingDish}
                delivery={editingDelivery}
                onSubmit={(data) => {
                  if (data.type === "restaurant") { adminAction === "add" ? addR(data.name, data.address!) : editingRestaurant && editR(editingRestaurant.id, data.name, data.address!); }
                  else if (data.type === "dish") { adminAction === "add" && editingRestaurant ? addD(editingRestaurant.id, data.name, data.price!) : editingRestaurant && editingDish && editD(editingRestaurant.id, editingDish.id, data.name, data.price!); }
                  else { adminAction === "add" ? addDel(data.name, data.phone!, data.vehicle!) : editingDelivery && editDel(editingDelivery.id, data.name, data.phone!, data.vehicle!); }
                  setShowAdminDialog(false); setEditingRestaurant(null); setEditingDish(null); setEditingDelivery(null);
                }}
                onClose={() => { setShowAdminDialog(false); setEditingRestaurant(null); setEditingDish(null); setEditingDelivery(null); }}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Order Detail Dialog ── */}
      <Dialog.Root open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl w-full max-w-md z-50 text-foreground shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-card z-10">
              <Dialog.Title className="text-lg font-bold">Detalle del Pedido</Dialog.Title>
              <Dialog.Close className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            {currentOrder && (
              <div className="px-6 py-5 space-y-5">
                <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Pedido #</span><span className="font-semibold">{currentOrder.id}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Restaurante</span><span className="font-medium">{currentOrder.restaurantName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Dirección</span><span className="font-medium text-right max-w-[200px]">{currentOrder.address}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold text-primary">S/. {currentOrder.total.toFixed(2)}</span></div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Package className="w-4 h-4 text-primary" />Productos</h3>
                  <div className="space-y-2">
                    {currentOrder.items.map(item => (
                      <div key={item.dish.id} className="flex justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                        <span>{item.dish.name} ×{item.quantity}</span>
                        <span className="font-medium">S/. {(item.dish.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentOrder.deliveryPerson && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Bike className="w-4 h-4 text-primary" />Repartidor</h3>
                    <div className="flex items-center gap-4 bg-muted/40 rounded-xl p-4">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0"><Bike className="w-6 h-6 text-primary" /></div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{currentOrder.deliveryPerson.name}</p>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs mb-0.5"><Star className="w-3 h-3 fill-yellow-500" />{currentOrder.deliveryPerson.rating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">{currentOrder.deliveryPerson.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{currentOrder.deliveryPerson.phone}</p>
                      </div>
                      <a href={`tel:${currentOrder.deliveryPerson.phone}`} className="flex flex-col items-center gap-1 bg-primary text-white p-3 rounded-xl hover:bg-orange-600 transition-colors">
                        <Phone className="w-4 h-4" /><span className="text-xs">Llamar</span>
                      </a>
                    </div>
                  </div>
                )}

                <div className={`rounded-xl p-3 text-sm text-center font-medium ${currentOrder.status === "delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-primary/10 text-primary"}`}>
                  {currentOrder.status === "received" && "✓ Pedido recibido — preparando tu orden"}
                  {currentOrder.status === "preparing" && "🍳 Cocinando tu pedido"}
                  {currentOrder.status === "on-way" && "🛵 En camino a tu dirección"}
                  {currentOrder.status === "delivered" && "✓ ¡Pedido entregado! Buen provecho"}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Profile Dialog ── */}
      <Dialog.Root open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl w-full max-w-sm z-50 text-foreground shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <Dialog.Title className="text-lg font-bold">Mi Perfil</Dialog.Title>
              <Dialog.Close className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="px-6 py-5">
              {currentUser && <ProfileForm user={currentUser} onSave={updateProfile} onClose={() => setShowProfileDialog(false)} />}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

// ─── Hero Carousel ─────────────────────────────────────────────────────────────

interface Slide { img: string; badge: string; title: string; sub: string; accent: string; }

function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % total), 4500);
    return () => clearInterval(t);
  }, [total]);

  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  return (
    <div className="relative h-64 md:h-80 overflow-hidden bg-muted">
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 1 : 0 }}
        >
          <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.accent}`} />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <span className="inline-block bg-white/90 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">{s.badge}</span>
            <h2 className="text-white text-2xl md:text-4xl font-bold mb-2 drop-shadow">{s.title}</h2>
            <p className="text-white/90 text-sm md:text-base max-w-sm drop-shadow">{s.sub}</p>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── QR Components ─────────────────────────────────────────────────────────────

function YapeQR({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200">
        <div className="w-40 h-40 relative">
          <svg viewBox="0 0 41 41" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="41" height="41" fill="white" />
            {/* Corner squares */}
            <rect x="1" y="1" width="11" height="11" fill="#6B21A8" rx="1.5" />
            <rect x="3" y="3" width="7" height="7" fill="white" rx="0.5" />
            <rect x="4" y="4" width="5" height="5" fill="#6B21A8" rx="0.5" />
            <rect x="29" y="1" width="11" height="11" fill="#6B21A8" rx="1.5" />
            <rect x="31" y="3" width="7" height="7" fill="white" rx="0.5" />
            <rect x="32" y="4" width="5" height="5" fill="#6B21A8" rx="0.5" />
            <rect x="1" y="29" width="11" height="11" fill="#6B21A8" rx="1.5" />
            <rect x="3" y="31" width="7" height="7" fill="white" rx="0.5" />
            <rect x="4" y="32" width="5" height="5" fill="#6B21A8" rx="0.5" />
            {/* Data modules pattern */}
            {[14, 15, 17, 18, 20, 22, 24, 25, 27].map(x => <rect key={`t${x}`} x={x} y="2" width="1.5" height="1.5" fill="#6B21A8" />)}
            {[14, 16, 18, 21, 23, 26, 28].map(x => <rect key={`t2${x}`} x={x} y="4" width="1.5" height="1.5" fill="#6B21A8" />)}
            {[13, 15, 16, 19, 22, 24, 27].map(x => <rect key={`m${x}`} x={x} y="14" width="1.5" height="1.5" fill="#6B21A8" />)}
            {[14, 17, 19, 21, 23, 25, 28].map(x => <rect key={`m2${x}`} x={x} y="17" width="1.5" height="1.5" fill="#6B21A8" />)}
            {[13, 16, 18, 20, 22, 24, 27].map(x => <rect key={`m3${x}`} x={x} y="20" width="1.5" height="1.5" fill="#6B21A8" />)}
            {[14, 15, 17, 21, 23, 25, 26, 28].map(x => <rect key={`b${x}`} x={x} y="30" width="1.5" height="1.5" fill="#6B21A8" />)}
            {[13, 16, 18, 20, 22, 24, 27].map(x => <rect key={`b2${x}`} x={x} y="33" width="1.5" height="1.5" fill="#6B21A8" />)}
            {[14, 17, 19, 21, 23, 26, 28].map(x => <rect key={`b3${x}`} x={x} y="36" width="1.5" height="1.5" fill="#6B21A8" />)}
            {/* Center logo */}
            <rect x="16" y="16" width="9" height="9" fill="#6B21A8" rx="1" />
            <text x="20.5" y="22.5" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">Y</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">S/. {amount.toFixed(2)}</p>
    </div>
  );
}

function PlinQR({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200">
        <div className="w-40 h-40 relative">
          <svg viewBox="0 0 41 41" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="41" height="41" fill="white" />
            <rect x="1" y="1" width="11" height="11" fill="#0070BA" rx="1.5" />
            <rect x="3" y="3" width="7" height="7" fill="white" rx="0.5" />
            <rect x="4" y="4" width="5" height="5" fill="#0070BA" rx="0.5" />
            <rect x="29" y="1" width="11" height="11" fill="#0070BA" rx="1.5" />
            <rect x="31" y="3" width="7" height="7" fill="white" rx="0.5" />
            <rect x="32" y="4" width="5" height="5" fill="#0070BA" rx="0.5" />
            <rect x="1" y="29" width="11" height="11" fill="#0070BA" rx="1.5" />
            <rect x="3" y="31" width="7" height="7" fill="white" rx="0.5" />
            <rect x="4" y="32" width="5" height="5" fill="#0070BA" rx="0.5" />
            {[13, 16, 18, 20, 22, 25, 27].map(x => <rect key={x} x={x} y="2" width="1.5" height="1.5" fill="#0070BA" />)}
            {[14, 17, 19, 21, 23, 26, 28].map(x => <rect key={x} x={x} y="5" width="1.5" height="1.5" fill="#0070BA" />)}
            {[13, 15, 18, 20, 22, 24, 27].map(x => <rect key={x} x={x} y="15" width="1.5" height="1.5" fill="#0070BA" />)}
            {[14, 16, 19, 21, 23, 25, 28].map(x => <rect key={x} x={x} y="18" width="1.5" height="1.5" fill="#0070BA" />)}
            {[13, 16, 18, 20, 22, 24, 27].map(x => <rect key={x} x={x} y="21" width="1.5" height="1.5" fill="#0070BA" />)}
            {[14, 15, 17, 21, 23, 25, 26, 28].map(x => <rect key={x} x={x} y="31" width="1.5" height="1.5" fill="#0070BA" />)}
            {[13, 16, 18, 20, 22, 24, 27].map(x => <rect key={x} x={x} y="34" width="1.5" height="1.5" fill="#0070BA" />)}
            <rect x="16" y="16" width="9" height="9" fill="#0070BA" rx="1" />
            <text x="20.5" y="22.5" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">P</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">S/. {amount.toFixed(2)}</p>
    </div>
  );
}

// ─── Card Form ─────────────────────────────────────────────────────────────────

function CardForm() {
  const [num, setNum] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const formatNum = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const brand = num.replace(/\s/g, "").startsWith("4") ? "Visa"
    : num.replace(/\s/g, "").startsWith("5") ? "Mastercard" : "";

  return (
    <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Número de tarjeta</label>
        <div className="relative">
          <input value={num} onChange={e => setNum(formatNum(e.target.value))} placeholder="0000 0000 0000 0000" className={inputCls} maxLength={19} />
          {brand && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">{brand}</span>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Nombre en la tarjeta</label>
        <input value={name} onChange={e => setName(e.target.value.toUpperCase())} placeholder="JUAN PÉREZ" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5">Vencimiento</label>
          <input value={exp} onChange={e => setExp(formatExp(e.target.value))} placeholder="MM/AA" className={inputCls} maxLength={5} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">CVV</label>
          <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" className={inputCls} maxLength={4} type="password" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <CreditCard className="w-3.5 h-3.5" />Tus datos están protegidos con cifrado SSL
      </p>
    </div>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────────

function LoginForm({ onLogin, onClose }: { onLogin: (email: string, password: string, name?: string) => boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, isRegister ? name : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isRegister && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Nombre</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" required className={inputCls} />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Correo</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
      </div>
      <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors mt-1">
        {isRegister ? "Crear cuenta" : "Iniciar sesión"}
      </button>
      <button type="button" onClick={() => setIsRegister(!isRegister)} className="w-full text-sm text-primary hover:underline">
        {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
      </button>
      <button type="button" onClick={onClose} className="w-full border border-border py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground">
        Continuar sin cuenta
      </button>
    </form>
  );
}

// ─── Report Form ───────────────────────────────────────────────────────────────

function ReportForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState("");
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [urgency, setUrgency] = useState("normal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Reporte enviado. Te contactaremos pronto.");
    onClose();
  };

  const cats = ["Pedido incorrecto", "No llegó el pedido", "Problema con el repartidor", "Cobro incorrecto", "Tiempo de espera excesivo", "Producto en mal estado", "Otro"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Categoría del problema *</label>
        <div className="grid grid-cols-1 gap-1.5">
          {cats.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-all ${category === c ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-muted-foreground/40"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">
            <span className="flex items-center gap-1"><Hash className="w-3 h-3" />N° de pedido</span>
          </label>
          <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Ej: 12345" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Urgencia</label>
          <div className="flex gap-2 h-[50px]">
            {[["normal", "Normal"], ["alta", "Alta"]].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setUrgency(v)} className={`flex-1 text-sm rounded-lg border transition-all ${urgency === v ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-muted-foreground/40"}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />Descripción detallada *</span>
        </label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe qué ocurrió, cuándo y cómo podemos ayudarte..." required rows={4} className={`${inputCls} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Tu nombre</label>
          <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Juan Pérez" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Teléfono</label>
          <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+51 900 000 000" className={inputCls} />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-border py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
        <button type="submit" disabled={!category || !description} className="flex-1 bg-destructive text-destructive-foreground py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">Enviar reporte</button>
      </div>
    </form>
  );
}

// ─── Profile Form ──────────────────────────────────────────────────────────────

function ProfileForm({ user, onSave, onClose }: { user: AppUser; onSave: (n: string, a: string, p: string) => void; onClose: () => void }) {
  const [name, setName] = useState(user.name || "");
  const [address, setAddress] = useState(user.address || "");
  const [phone, setPhone] = useState(user.phone || "");

  return (
    <div>
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-primary opacity-60" />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer hover:bg-orange-600 transition-colors">
            <Edit2 className="w-3 h-3" />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mb-5 bg-muted/40 rounded-lg px-3 py-2">{user.email}</p>
      <form onSubmit={e => { e.preventDefault(); onSave(name, address, phone); onClose(); }} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Nombre completo</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Domicilio</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Av. Ejemplo 123, Arequipa" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Teléfono</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+51 900 000 000" className={inputCls} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-border py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
          <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">Guardar</button>
        </div>
      </form>
    </div>
  );
}

// ─── Admin Form ────────────────────────────────────────────────────────────────

interface AdminFormData {
  type: "restaurant" | "dish" | "delivery";
  name: string;
  address?: string;
  price?: number;
  phone?: string;
  vehicle?: string;
}

function AdminForm({ action, type, restaurant, dish, delivery, onSubmit, onClose }: {
  action: "add" | "edit";
  type: "restaurant" | "dish" | "delivery";
  restaurant: Restaurant | null;
  dish: Dish | null;
  delivery: Delivery | null;
  onSubmit: (d: AdminFormData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(
    type === "restaurant" ? restaurant?.name || "" : type === "dish" ? dish?.name || "" : delivery?.name || ""
  );
  const [address, setAddress] = useState(restaurant?.address || "");
  const [price, setPrice] = useState(dish?.price || 0);
  const [phone, setPhone] = useState(delivery?.phone || "");
  const [vehicle, setVehicle] = useState(delivery?.vehicle || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "restaurant") onSubmit({ type: "restaurant", name, address });
    else if (type === "dish") onSubmit({ type: "dish", name, price });
    else onSubmit({ type: "delivery", name, phone, vehicle });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={type === "restaurant" ? "Restaurante A" : type === "dish" ? "Lomo Saltado" : "Carlos Quispe"} required className={inputCls} />
      </div>
      {type === "restaurant" && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Dirección</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Av. Perú 123" required className={inputCls} />
        </div>
      )}
      {type === "dish" && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Precio (S/.)</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required className={inputCls} />
        </div>
      )}
      {type === "delivery" && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Teléfono</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+51 900 000 000" required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Vehículo</label>
            <input type="text" value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="Moto Honda Wave" required className={inputCls} />
          </div>
        </>
      )}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-border py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
        <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">{action === "add" ? "Agregar" : "Guardar"}</button>
      </div>
    </form>
  );
}
