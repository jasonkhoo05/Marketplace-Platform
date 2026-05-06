// mockProducts.ts later be replaced by API/Supabase fetch

import { Product } from "@/types/product";

export const mockProducts: Product[] = [
    {
        id: "1",
        name: "Denim Jacket",
        description: "Classic denim jacket with modern fit",
        price: 99.99,
        quantity: 45,
        category: { prod_cat_id: 4, prod_cat_name: "FASHION (MEN)" },
        categoryId: 4,
        imageUrls: ["/products/DenimJacket.jpg"],
        sales: 234,
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Cargo Pants",
        description: "Comfortable cargo pants with multiple pockets",
        price: 59.99,
        quantity: 23,
        category: { prod_cat_id: 4, prod_cat_name: "FASHION (MEN)" },
        categoryId: 4,
        imageUrls: ["/products/CargoPants.jpg"],
        sales: 156,
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        name: "T-Shirt",
        description: "Comfortable cotton t-shirt for everyday wear",
        price: 19.99,
        quantity: 67,
        category: { prod_cat_id: 4, prod_cat_name: "FASHION (MEN)" },
        categoryId: 4,
        imageUrls: ["/products/T-shirt.jpg"],
        sales: 189,
        createdAt: new Date().toISOString(),
    },
    {
        id: "4",
        name: "Hoodie",
        description: "Warm and cozy hoodie perfect for cold weather",
        price: 39.99,
        quantity: 0,
        category: { prod_cat_id: 4, prod_cat_name: "FASHION (MEN)" },
        categoryId: 4,
        imageUrls: ["/products/hoodie.jpg"],
        sales: 98,
        createdAt: new Date().toISOString(),
    },
];