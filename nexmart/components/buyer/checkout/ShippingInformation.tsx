import { FiMapPin } from "react-icons/fi";
import type { BuyerProfile } from "@/types/checkout";

type Props = {
  profile: BuyerProfile;
};

export default function ShippingInformation({ profile }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <FiMapPin className="text-teal-700" />
        <h2 className="text-xl font-bold text-slate-900">
          Shipping Information
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Info label="Full Name" value={profile.username} />
        <Info label="Email" value={profile.email} />
        <Info label="Phone Number" value={profile.phone} />
        <Info label="Country" value={profile.country} />

        <div className="md:col-span-2">
          <Info label="Address" value={profile.address} />
        </div>

        <Info label="City" value={profile.city} />
        <Info label="State / Province" value={profile.state} />
        <Info label="ZIP / Postal Code" value={profile.postalCode} />
      </div>

      <p className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
        This is a frontend-only checkout demo. In real backend integration,
        buyer shipping information should be retrieved from the logged-in user
        profile.
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-2 text-sm text-slate-500">{value}</p>
    </div>
  );
}