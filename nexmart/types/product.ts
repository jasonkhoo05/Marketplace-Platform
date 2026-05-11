// keeps product data structure reusable for backend later

export interface ProductCategory {
    prod_cat_id: number;
    prod_cat_name: string;
}

// export interface ProductCategoryLink {
//     prod_id: number;
//     prod_cat_id: number;
// }

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string[];
    // categoryId: number;
    imageUrls: string[];
    sales: number;
    // createdAt: string;
}


export interface ProductFormData {
    name: string;
    description: string;
    price: string;
    quantity: string;
    // category: ProductCategory | "";
    category: string[];

    // categoryId: number;
    imageUrls: string[];
}