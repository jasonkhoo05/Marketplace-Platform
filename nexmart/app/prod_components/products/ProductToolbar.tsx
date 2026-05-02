// components/products/ProductToolbar.tsx

type ProductToolbarProps = {
    count: number;
  };

export default function ProductToolbar({ count }: ProductToolbarProps) {
  return (
    <div className="mb-6 flex justify-between rounded-2xl border bg-white p-5">
      <p>Showing {count} products</p>

      <select className="border px-3 py-2">
        <option>Most Popular</option>
      </select>
    </div>
  );
}