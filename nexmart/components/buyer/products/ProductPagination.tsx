type ProductPaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  
  export default function ProductPagination({
    currentPage,
    totalPages,
    onPageChange,
  }: ProductPaginationProps) {
    if (totalPages <= 1) return null;
  
    return (
      <div className="mt-10 flex items-center justify-center gap-5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-sm font-medium text-slate-500 transition hover:text-teal-700 disabled:opacity-30"
        >
          Previous
        </button>
  
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
  
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                  currentPage === page
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
  
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-sm font-medium text-slate-500 transition hover:text-teal-700 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    );
  }