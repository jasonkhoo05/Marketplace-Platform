// lib/products.ts
// Temporary mock product data.
// Later, this can be replaced with Supabase data.

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  seller: string;
  quantitySold: number;
  stockQuantity: number;
  createdAt: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Denim Jacket",
    price: 89,
    category: "Jacket",
    image: "/products/DenimJacket.jpg",
    rating: 4.5,
    seller: "NexMart Fashion",
    quantitySold: 25,
    stockQuantity: 10,
    createdAt: "2026-05-01",
  },
  {
    id: 2,
    name: "Cargo Pants",
    price: 69,
    category: "Pants",
    image: "/products/CargoPants.jpg",
    rating: 4.2,
    seller: "StreetWear Seller",
    quantitySold: 18,
    stockQuantity: 5,
    createdAt: "2026-05-02",
  },
  {
    id: 3,
    name: "Hoodie",
    price: 79,
    category: "Outerwear",
    image: "/products/hoodie.jpg",
    rating: 4.7,
    seller: "Comfy Clothing",
    quantitySold: 32,
    stockQuantity: 0,
    createdAt: "2026-05-03",
  },
  {
    id: 4,
    name: "T-shirt",
    price: 39,
    category: "T-shirt",
    image: "/products/T-shirt.jpg",
    rating: 4.0,
    seller: "Basic Apparel",
    quantitySold: 40,
    stockQuantity: 20,
    createdAt: "2026-05-01",
  },
];

export const categories = ["All", "Jacket", "Pants", "Outerwear", "T-shirt"];