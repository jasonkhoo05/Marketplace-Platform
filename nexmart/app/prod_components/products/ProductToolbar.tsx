// app/prod_components/products/ProductToolbar.tsx
export type SortOption =
  | "popular"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "newest";

type ProductToolbarProps = {
  count: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
};

export default function ProductToolbar({
  count,
  sort,
  onSortChange,
}: ProductToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border bg-white p-5">
      <p>Showing {count} products</p>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className="rounded-lg border px-3 py-2"
      >
        <option value="popular">Most Popular</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating_desc">Highest Rating</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}