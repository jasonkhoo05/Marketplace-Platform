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
    <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3">
      <p>Showing {count} products</p>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition outline-none hover:bg-slate-100 focus:border-teal-700"
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