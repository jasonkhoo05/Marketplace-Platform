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
    <aside className="h-fit rounded-2xl border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Filters</h2>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-medium text-teal-700"
        >
          Clear
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="mb-3 font-semibold">Price Range</h3>

          <div className="space-y-3">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="Min price"
              className="w-full rounded-lg border px-3 py-2"
            />

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Max price"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">Minimum Rating</h3>

          <select
            value={minRating}
            onChange={(event) => onMinRatingChange(event.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">Any rating</option>
            <option value="4.5">4.5 stars and above</option>
            <option value="4">4 stars and above</option>
            <option value="3">3 stars and above</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => onInStockOnlyChange(event.target.checked)}
          />
          In stock only
        </label>
      </div>
    </aside>
  );
}