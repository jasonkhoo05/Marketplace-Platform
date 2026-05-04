// mockProducts.ts later be replaced by API/Supabase fetch

import { Product } from "@/types/product";

export const mockProducts: Product[] = [
    {
        id: "1",
        name: "Denim Jacket",
        price: 99.99,
        quantity: 45,
        category: "Fashion",
        imageUrls: ["/products/DenimJacket.jpg"],
        sales: 234,
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Cargo Pants",
        price: 59.99,
        quantity: 23,
        category: "Fashion",
        imageUrls: ["/products/CargoPants.jpg"],
        sales: 156,
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        name: "T-Shirt",
        price: 19.99,
        quantity: 67,
        category: "Fashion",
        imageUrls: ["/products/T-shirt.jpg"],
        sales: 189,
        createdAt: new Date().toISOString(),
    },
    {
        id: "4",
        name: "Hoodie",
        price: 39.99,
        quantity: 0,
        category: "Fashion",
        imageUrls: ["/products/hoodie.jpg"],
        sales: 98,
        createdAt: new Date().toISOString(),
    },
];