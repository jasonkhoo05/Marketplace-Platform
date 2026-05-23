export type CheckoutCartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number; // product stock
    imageUrls: string[];
    seller: string;
    cartQuantity: number; // quantity buyer wants to buy
  };
  
  export type BuyerProfile = {
    username: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  export type PaymentMethod = "card" | "paypal" | "cash";
  
  export type MockOrderStatus =
    | "Cancelled"
    | "Shipped"
    | "Completed"
    | "Processing"
    | "Pending"
    | "Refunded";
  
  export type MockOrder = {
    id: string;
    buyerName: string;
    buyerEmail: string;
    buyerAddress: string;
    productName: string;
    productImage: string;
    quantity: number;
    totalPrice: number;
    orderDate: string;
    status: MockOrderStatus;
    paymentMethod: PaymentMethod;
  };