import API from './api';

export interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  image?: string;
  images: string[];
  sellerId: {
    _id: string;
    name: string;
    shopName?: string;
  };
  rating?: number;
  numReviews?: number;
  stock: number;
  description: string;
  usage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  sellerId?: string;
}

// Get all products with optional filters
export const getProducts = async (filters?: ProductFilters) => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.inStock !== undefined) params.append('inStock', filters.inStock.toString());
    if (filters?.sellerId) params.append('sellerId', filters.sellerId);

    const { data } = await API.get(`/products?${params.toString()}`);
    return data.data ?? [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Get products by specific seller (public)
export const getProductsBySeller = async (sellerId: string, filters?: Omit<ProductFilters, 'sellerId'>) => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);

    const { data } = await API.get(`/products/seller/${sellerId}/products?${params.toString()}`);
    return data.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

// Get single product by ID
export const getProduct = async (id: string) => {
  try {
    const { data } = await API.get(`/products/${id}`);
    return data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Get products by seller (for shop owner)
export const getSellerProducts = async () => {
  try {
    const { data } = await API.get('/products/seller/my-products');
    return data.data ?? [];
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return [];
  }
};

// Create new product (shop owner)
export const createProduct = async (productData: any) => {
  try {
    const { data } = await API.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product (shop owner)
export const updateProduct = async (id: string, productData: any) => {
  try {
    const { data } = await API.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product (shop owner)
export const deleteProduct = async (id: string) => {
  try {
    const { data } = await API.delete(`/products/${id}`);
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Update stock (shop owner)
export const updateStock = async (id: string, stock: number) => {
  try {
    const { data } = await API.patch(`/products/${id}/stock`, { stock });
    return data.data;
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

// Categories
import { Sprout, FlaskConical, Bug, Wrench, Droplets, Beef, LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const categories: Category[] = [
  { id: 'seeds',       name: 'Seeds',        icon: Sprout,       color: 'text-green-600',  bg: 'bg-green-100' },
  { id: 'fertilizers', name: 'Fertilizers',  icon: FlaskConical, color: 'text-lime-600',   bg: 'bg-lime-100' },
  { id: 'pesticides',  name: 'Pesticides',   icon: Bug,          color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'tools',       name: 'Farming Tools',icon: Wrench,       color: 'text-blue-600',   bg: 'bg-blue-100' },
  { id: 'irrigation',  name: 'Irrigation',   icon: Droplets,     color: 'text-cyan-600',   bg: 'bg-cyan-100' },
  { id: 'feed',        name: 'Animal Feed',  icon: Beef,         color: 'text-amber-600',  bg: 'bg-amber-100' },
];
