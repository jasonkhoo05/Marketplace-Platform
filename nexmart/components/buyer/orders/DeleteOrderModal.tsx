// components/buyer/orders/DeleteOrderModal.tsx

type Props = {
    orderId: string;
    onCancel: () => void;
    onConfirm: () => void;
  };
  
  export default function DeleteOrderModal({
    orderId,
    onCancel,
    onConfirm,
  }: Props) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900">Delete order?</h2>
  
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Are you sure you want to delete order{" "}
            <span className="font-semibold text-slate-700">#{orderId}</span>?
            This action will remove it from your order history.
          </p>
  
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
  
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete Order
            </button>
          </div>
        </div>
      </div>
    );
  }