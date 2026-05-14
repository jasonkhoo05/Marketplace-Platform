
export type OrderStatus = 'Cancelled' | 'Shipped' | 'Completed' | 'Processing' | 'Pending' | 'Refunded';

export interface Order {
    id: string;
    buyerName: string;
    buyerEmail: string;
    productName: string;
    productImage: string;
    quantity: number;
    totalPrice: number;
    orderDate: string;
    status: OrderStatus;
}