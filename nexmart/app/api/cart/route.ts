import { NextRequest, NextResponse } from "next/server";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
  stockQuantity: number;
};

type AddToCartRequestBody = {
  product?: {
    id?: number;
    name?: string;
    price?: number;
    image?: string;
    seller?: string;
    stockQuantity?: number;
  };
  quantity?: number;
};

type UpdateCartRequestBody = {
  productId?: number;
  quantity?: number;
};

declare global {
  // This is temporary mock storage.
  // Your teammate can later replace this with Supabase cart table logic.
  // eslint-disable-next-line no-var
  var mockCartItems: CartItem[] | undefined;
}

const cartItems = globalThis.mockCartItems ?? [];
globalThis.mockCartItems = cartItems;

function calculateSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function createCartResponse() {
  return {
    items: cartItems,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: calculateSubtotal(cartItems),
  };
}

function isPositiveWholeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isValidProduct(product: AddToCartRequestBody["product"]) {
  return (
    product !== undefined &&
    isPositiveWholeNumber(product.id) &&
    typeof product.name === "string" &&
    product.name.trim() !== "" &&
    typeof product.price === "number" &&
    product.price >= 0 &&
    typeof product.image === "string" &&
    product.image.trim() !== "" &&
    typeof product.seller === "string" &&
    product.seller.trim() !== "" &&
    isPositiveWholeNumber(product.stockQuantity)
  );
}

export async function GET() {
  return NextResponse.json(createCartResponse());
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AddToCartRequestBody;
    const { product, quantity } = body;

    if (!isValidProduct(product)) {
      return NextResponse.json(
        { error: "Invalid product details." },
        { status: 400 }
      );
    }

    if (!isPositiveWholeNumber(quantity)) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 }
      );
    }

    if (product.stockQuantity <= 0) {
      return NextResponse.json(
        { error: "This product is out of stock." },
        { status: 400 }
      );
    }

    const existingItem = cartItems.find((item) => item.id === product.id);
    const quantityToAdd = Math.min(quantity, product.stockQuantity);

    if (existingItem) {
      existingItem.quantity = Math.min(
        existingItem.quantity + quantityToAdd,
        existingItem.stockQuantity
      );
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        seller: product.seller,
        quantity: quantityToAdd,
        stockQuantity: product.stockQuantity,
      });
    }

    return NextResponse.json(
      {
        message: "Product added to cart.",
        ...createCartResponse(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to add product to cart." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateCartRequestBody;
    const { productId, quantity } = body;

    if (!isPositiveWholeNumber(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID." },
        { status: 400 }
      );
    }

    if (!isPositiveWholeNumber(quantity)) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 }
      );
    }

    const item = cartItems.find((cartItem) => cartItem.id === productId);

    if (!item) {
      return NextResponse.json(
        { error: "Cart item not found." },
        { status: 404 }
      );
    }

    item.quantity = Math.min(quantity, item.stockQuantity);

    return NextResponse.json({
      message: "Cart item updated.",
      ...createCartResponse(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update cart item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const productIdParam = request.nextUrl.searchParams.get("productId");

  if (!productIdParam) {
    cartItems.length = 0;

    return NextResponse.json({
      message: "Cart cleared.",
      ...createCartResponse(),
    });
  }

  const productId = Number(productIdParam);

  if (!isPositiveWholeNumber(productId)) {
    return NextResponse.json(
      { error: "Invalid product ID." },
      { status: 400 }
    );
  }

  const itemIndex = cartItems.findIndex((item) => item.id === productId);

  if (itemIndex === -1) {
    return NextResponse.json(
      { error: "Cart item not found." },
      { status: 404 }
    );
  }

  cartItems.splice(itemIndex, 1);

  return NextResponse.json({
    message: "Cart item removed.",
    ...createCartResponse(),
  });
}