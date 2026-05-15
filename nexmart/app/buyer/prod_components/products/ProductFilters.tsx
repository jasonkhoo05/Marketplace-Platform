// app/prod_components/products/ProductFilters.tsx
type ProductFiltersProps = {
  minPrice: string;
  maxPrice: string;
  minRating: string;
  inStockOnly: boolean;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinRatingChange: (value: string) => void;
  onInStockOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
};

export default function ProductFilters({
  minPrice,
  maxPrice,
  minRating,
  inStockOnly,
  onMinPriceChange,
  onMaxPriceChange,
  onMinRatingChange,
  onInStockOnlyChange,
  onClearFilters,
}: ProductFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Filters</h2>

        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-medium text-teal-700 hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        <details className="group rounded-lg border border-slate-200" open>
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 group-open:bg-teal-700 group-open:text-white">
              <span>Price Range</span>
              <span className="text-sm text-teal-700 group-open:text-white">+</span>
            </div>
          </summary>

          <div className="space-y-2 p-3">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="Min price"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Max price"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />
          </div>
        </details>

        <details className="group rounded-lg border border-slate-200">
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 group-open:bg-teal-700 group-open:text-white">
              <span>Rating</span>
              <span className="text-sm text-teal-700 group-open:text-white">+</span>
            </div>
          </summary>

          <div className="p-3">
            <select
              value={minRating}
              onChange={(event) => onMinRatingChange(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-700"
            >
              <option value="">Any rating</option>
              <option value="4.5">4.5 stars and above</option>
              <option value="4">4 stars and above</option>
              <option value="3">3 stars and above</option>
            </select>
          </div>
        </details>

        <details className="group rounded-lg border border-slate-200">
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 group-open:bg-teal-700 group-open:text-white">
              <span>Stock</span>
              <span className="text-sm text-teal-700 group-open:text-white">+</span>
            </div>
          </summary>

          <div className="p-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) =>
                  onInStockOnlyChange(event.target.checked)
                }
              />
              In stock only
            </label>
          </div>
        </details>
      </div>
    </section>
  );
}