import { products } from "@/lib/products";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    notFound();
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="mt-4 text-xl font-bold text-teal-700">${product.price}</p>
      <p className="mt-2 text-slate-600">Seller: {product.seller}</p>
      <p className="mt-2 text-slate-600">Rating: {product.rating}</p>
      <p className="mt-2 text-slate-600">{product.quantitySold} sold</p>
    </main>
  );
}