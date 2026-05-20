
export interface ProductCategory {
    prod_cat_id: number;
    prod_cat_name: string;
}


export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string[];
    categoryId: number;
    imageUrls: string[];
    sales: number;
    // createdAt: string;

    status: "pending" | "approved" | "hidden";
    rejectionReason: string;
}
export interface ProductFormData {
    name: string;
    description: string;
    price: string;
    quantity: string;
    // category: ProductCategory | "";
    category: string[];
    categoryId: number;
    imageUrls: string[];
}