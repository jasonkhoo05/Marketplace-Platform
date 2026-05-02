// components/products/ProductFilters.tsx
export default function ProductFilters() {
    return (
      <aside className="rounded-2xl border bg-white p-6">
        <h2 className="mb-6 text-xl font-bold">Filters</h2>
  
        <div>
          <h3 className="mb-3 font-semibold">Price Range</h3>
          <label><input type="checkbox" /> Under $50</label>
        </div>
      </aside>
    );
  }