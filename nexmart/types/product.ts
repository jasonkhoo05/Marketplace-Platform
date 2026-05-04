// keeps product data structure reusable for backend later

export type ProductCategory =
    | "Electronics"
    | "Fashion"
    | "Home"
    | "Beauty"
    | "Sports"
    | "Books"
    | "Others";

export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: ProductCategory;
    imageUrls: string[];
    sales: number;
    createdAt: string;
}

export interface ProductFormData {
    name: string;
    price: string;
    quantity: string;
    category: ProductCategory | "";
    imageUrls: string[];
}