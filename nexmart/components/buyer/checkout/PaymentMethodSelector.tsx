import { FiCreditCard } from "react-icons/fi";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/checkout";

type Props = {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (value: PaymentMethod) => void;
};

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <FiCreditCard className="text-teal-700" />
        <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
      </div>

      <div className="space-y-4">
        {PAYMENT_METHODS.map((method) => (
          <PaymentOption
            key={method.id}
            label={method.label}
            description={method.description}
            value={method.id}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={onPaymentMethodChange}
          />
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
        Google Pay is the only active payment method for now. To add more methods
        later, add another entry to PAYMENT_METHODS in types/checkout.ts and
        update the checkout API validation.
      </p>
    </div>
  );
}

function PaymentOption({
  label,
  description,
  value,
  paymentMethod,
  onPaymentMethodChange,
}: {
  label: string;
  description: string;
  value: PaymentMethod;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (value: PaymentMethod) => void;
}) {
  const isSelected = paymentMethod === value;

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        isSelected
          ? "border-teal-600 bg-teal-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <input
        type="radio"
        checked={isSelected}
        onChange={() => onPaymentMethodChange(value)}
        className="mt-1"
      />

      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </label>
  );
}