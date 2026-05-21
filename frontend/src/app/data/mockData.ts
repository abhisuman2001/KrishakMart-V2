// Mock data for the agriculture e-commerce platform

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  shopOwner: string;
  shopOwnerId: string;
  rating: number;
  stock: number;
  description: string;
  usage: string;
}

export interface Order {
  id: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  totalAmount: number;
  status: 'Packed' | 'Shipped' | 'Delivered' | 'Pending';
  orderDate: string;
  customerName?: string;
  deliveryAddress?: string;
}

export const categories = [
  { id: 'seeds',       name: 'Seeds',         icon: 'Sprout',       color: 'text-green-600',  bg: 'bg-green-100' },
  { id: 'fertilizers', name: 'Fertilizers',   icon: 'FlaskConical', color: 'text-lime-600',   bg: 'bg-lime-100' },
  { id: 'pesticides',  name: 'Pesticides',    icon: 'Bug',          color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'tools',       name: 'Farming Tools', icon: 'Wrench',       color: 'text-blue-600',   bg: 'bg-blue-100' },
  { id: 'irrigation',  name: 'Irrigation',    icon: 'Droplets',     color: 'text-cyan-600',   bg: 'bg-cyan-100' },
  { id: 'feed',        name: 'Animal Feed',   icon: 'Beef',         color: 'text-amber-600',  bg: 'bg-amber-100' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Wheat Seeds Premium Quality',
    category: 'seeds',
    brand: 'AgriGrow',
    price: 850,
    image: 'https://images.unsplash.com/photo-1693307297659-61e4ee3de0ba?w=400',
    shopOwner: 'Green Valley Agro Store',
    shopOwnerId: 'shop1',
    rating: 4.5,
    stock: 150,
    description: 'Premium quality wheat seeds with high yield potential. Disease resistant variety suitable for all soil types.',
    usage: 'Ideal for winter season cultivation. Sow 40-50 kg per acre.'
  },
  {
    id: '2',
    name: 'Organic Fertilizer 50kg',
    category: 'fertilizers',
    brand: 'NatureFert',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1678687975782-4dc5be103a03?w=400',
    shopOwner: 'FarmSupply Hub',
    shopOwnerId: 'shop2',
    rating: 4.8,
    stock: 200,
    description: 'Organic fertilizer enriched with essential nutrients. Improves soil health and crop productivity.',
    usage: 'Apply 2-3 bags per acre during soil preparation.'
  },
  {
    id: '3',
    name: 'Rice Seeds Hybrid Variety',
    category: 'seeds',
    brand: 'SeedMaster',
    price: 950,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    shopOwner: 'Green Valley Agro Store',
    shopOwnerId: 'shop1',
    rating: 4.6,
    stock: 120,
    description: 'High-yielding hybrid rice seeds resistant to common pests and diseases.',
    usage: 'Suitable for paddy cultivation. Use 10-12 kg per acre.'
  },
  {
    id: '4',
    name: 'Drip Irrigation Kit',
    category: 'irrigation',
    brand: 'WaterSave',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1598370006836-0ae5f7ec61c4?w=400',
    shopOwner: 'Modern Farming Equipment',
    shopOwnerId: 'shop3',
    rating: 4.9,
    stock: 35,
    description: 'Complete drip irrigation system for efficient water management. Saves up to 70% water.',
    usage: 'Covers 1 acre. Easy installation with all components included.'
  },
  {
    id: '5',
    name: 'Premium Cattle Feed 25kg',
    category: 'feed',
    brand: 'NutriCattle',
    price: 780,
    image: 'https://images.unsplash.com/photo-1629193153251-16b3ea7b69d2?w=400',
    shopOwner: 'FarmSupply Hub',
    shopOwnerId: 'shop2',
    rating: 4.7,
    stock: 180,
    description: 'Nutritious cattle feed with balanced proteins, vitamins, and minerals for healthy livestock.',
    usage: 'Feed 2-3 kg per cattle daily for best results.'
  },
  {
    id: '6',
    name: 'Garden Spray Pump',
    category: 'tools',
    brand: 'SprayPro',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1655980235599-8e3d642e4993?w=400',
    shopOwner: 'Modern Farming Equipment',
    shopOwnerId: 'shop3',
    rating: 4.4,
    stock: 75,
    description: 'Manual spray pump for pesticide and fertilizer application. Durable and easy to use.',
    usage: 'Suitable for small to medium farms. 16-liter capacity.'
  },
  {
    id: '7',
    name: 'Bio Pesticide Organic',
    category: 'pesticides',
    brand: 'EcoProtect',
    price: 650,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    shopOwner: 'Green Valley Agro Store',
    shopOwnerId: 'shop1',
    rating: 4.3,
    stock: 90,
    description: 'Organic bio-pesticide safe for crops and environment. Effective against common pests.',
    usage: 'Mix 50ml per 15 liters of water. Spray during early morning.'
  },
  {
    id: '8',
    name: 'NPK Fertilizer Complex',
    category: 'fertilizers',
    brand: 'CropBoost',
    price: 1100,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    shopOwner: 'FarmSupply Hub',
    shopOwnerId: 'shop2',
    rating: 4.6,
    stock: 160,
    description: 'Balanced NPK fertilizer for all crops. Promotes healthy growth and higher yields.',
    usage: 'Apply 50-60 kg per acre as per crop requirement.'
  },
];

export const farmerOrders: Order[] = [
  {
    id: 'ORD001',
    products: [
      {
        productId: '1',
        productName: 'Wheat Seeds Premium Quality',
        quantity: 2,
        price: 850,
        image: 'https://images.unsplash.com/photo-1693307297659-61e4ee3de0ba?w=100'
      }
    ],
    totalAmount: 1700,
    status: 'Delivered',
    orderDate: '2026-02-01',
    deliveryAddress: 'Village Rampur, District Meerut'
  },
  {
    id: 'ORD002',
    products: [
      {
        productId: '2',
        productName: 'Organic Fertilizer 50kg',
        quantity: 3,
        price: 1200,
        image: 'https://images.unsplash.com/photo-1678687975782-4dc5be103a03?w=100'
      }
    ],
    totalAmount: 3600,
    status: 'Shipped',
    orderDate: '2026-02-05',
    deliveryAddress: 'Village Rampur, District Meerut'
  },
];

export const shopOwnerOrders: Order[] = [
  {
    id: 'ORD001',
    products: [
      {
        productId: '1',
        productName: 'Wheat Seeds Premium Quality',
        quantity: 2,
        price: 850,
        image: 'https://images.unsplash.com/photo-1693307297659-61e4ee3de0ba?w=100'
      }
    ],
    totalAmount: 1700,
    status: 'Delivered',
    orderDate: '2026-02-01',
    customerName: 'Ramesh Kumar',
    deliveryAddress: 'Village Rampur, District Meerut'
  },
  {
    id: 'ORD003',
    products: [
      {
        productId: '3',
        productName: 'Rice Seeds Hybrid Variety',
        quantity: 1,
        price: 950,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100'
      }
    ],
    totalAmount: 950,
    status: 'Packed',
    orderDate: '2026-02-07',
    customerName: 'Suresh Singh',
    deliveryAddress: 'Village Chandpur, District Bijnor'
  },
];
