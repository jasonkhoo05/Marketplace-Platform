"use client";

import { MdCameraAlt } from "react-icons/md";
import { IoExitOutline } from "react-icons/io5";
import { FiUser, FiShoppingBag, FiStar, FiLock, FiBox } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import UserProfileCard from "@/components/ui/UserProfileCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface FormState {
  username: string; full_name: string; email: string; phone: string;
  address: string; city: string; postcode: string; is_default: boolean;
  gender: string; dob_day: string; dob_month: string;
  dob_year: string; user_image: string;
}

const DEFAULT_FORM: FormState = {
  username: "", full_name: "", email: "", phone: "",
  address: "", city: "", postcode: "", is_default: false,
  gender: "", dob_day: "", dob_month: "", dob_year: "", user_image: "",
};

const sidebarItems = [
  { label: "Profile", href: "/profile", icon: FiUser, active: true  },
  { label: "Change Password", href: "#", icon: FiLock, active: false },
  { label: "My Purchases", href: "#", icon: FiShoppingBag, active: false },
  { label: "My Reviews", href: "#", icon: FiStar, active: false },
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("new") === "true";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isSaving, setIsSaving]= useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to load profile data.");

        const data = await res.json();

        // Fallback fields safely if null in database
        setForm({
          username: data.username || "",
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          postcode: data.postcode || "",
          is_default: data.is_default ?? false,
          gender: data.gender || "",
          dob_day: data.dob_day || "",
          dob_month: data.dob_month || "",
          dob_year: data.dob_year || "",
          user_image: data.user_image || "",
        });
        setAvatarPreview(data.user_image ?? "");
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setForm((prev) => ({ ...prev, user_image: result }));
    };
    reader.readAsDataURL(file);
  };

  // 2. SAVE PROFILE DATA TO BACKEND ON SUBMIT
  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      setSuccess("Profile saved successfully!");

      // If they are a new user completing onboarding, push them straight to the store!
      if (isNewUser) {
        setTimeout(() => {
          router.push("/products");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);
  const days  = Array.from({ length: 31 }, (_, i) => i + 1);



  const selectCls = "h-10 rounded-md border border-input bg-transparent px-3 py-1 text-[15px] shadow-sm outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700";

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar - matches SellerSidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-slate-200 bg-white z-30">
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white">
            <FiBox size={18} />
          </div>
          <span className="text-lg font-bold text-slate-900">NexMart</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {sidebarItems.map(({ label, href, icon: Icon, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active ? "bg-teal-700 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3">
            <UserProfileCard username={form.username} email={form.email} avatarUrl={avatarPreview} />
          </div>
          <Link href="/products" className="flex items-center justify-center text-sm text-slate-500 hover:text-teal-700 transition-colors">
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="pl-60 min-h-screen flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-6">
          {!isNewUser && (
            <Button variant="ghost" onClick={() => router.back()} className="ml-auto text-teal-700 hover:bg-teal-50 hover:text-teal-800 gap-1.5 font-medium text-[15px] px-4 py-2 h-auto">
              Back <IoExitOutline size={18} />
            </Button>
          )}
        </header>

        <div className="flex-1 p-6">
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

              {/* Card header */}
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800">My Profile</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage and protect your account</p>
              </div>

              <form onSubmit={handleSave}>
                {/* Form body: rows on left, avatar on right */}
                <div className="flex gap-0">

                  {/* Label-input rows */}
                  <div className="flex-1 px-6 py-5 space-y-6 border-r border-slate-100">

                    <Row label="Username">
                      <Input className="text-[15px] h-10 focus-visible:ring-teal-700" placeholder="your_username" value={form.username} onChange={set("username")} required />
                    </Row>

                    <Row label="Name">
                      <Input className="text-[15px] h-10 focus-visible:ring-teal-700" placeholder="Your full name" value={form.full_name} onChange={set("full_name")} />
                    </Row>

                    <Row label="Email">
                      <Input className="text-[15px] h-10 bg-slate-50 cursor-not-allowed text-slate-500" type="email" value={form.email} disabled />
                    </Row>

                    <Row label="Phone Number">
                      <Input className="text-[15px] h-10 focus-visible:ring-teal-700" type="tel" placeholder="+60 XXX XXX XXX" value={form.phone} onChange={set("phone")} />
                    </Row>

                    <Row label="Address">
                      <Input className="text-[15px] h-10 focus-visible:ring-teal-700" placeholder="e.g. 123 Jalan Jingga" value={form.address} onChange={set("address")} />
                    </Row>

                    <Row label="City">
                      <Input className="text-[15px] h-10 focus-visible:ring-teal-700" placeholder="e.g. Petaling Jaya" value={form.city} onChange={set("city")} />
                    </Row>

                    <Row label="Postcode">
                      <Input className="text-[15px] h-10 focus-visible:ring-teal-700" placeholder="e.g. 47810" value={form.postcode} onChange={set("postcode")} />
                    </Row>

                    <Row label="Default Address">
                      <div className="flex h-9 items-center">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={form.is_default}
                            onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))}
                            className="accent-teal-700 w-4 h-4" />
                          Set as default address
                        </label>
                      </div>
                    </Row>

                    <Row label="Gender">
                      <div className="flex gap-5 h-9 items-center">
                        {["Male","Female","Other"].map((g) => (
                          <label key={g} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="radio" name="gender" value={g}
                              checked={form.gender === g}
                              onChange={() => setForm((prev) => ({ ...prev, gender: g }))}
                              className="accent-teal-700 w-4 h-4" />
                            {g}
                          </label>
                        ))}
                      </div>
                    </Row>

                    <Row label="Date of Birth">
                      <div className="flex gap-2">
                        <select className={`${selectCls} flex-1`} value={form.dob_day} onChange={set("dob_day")}>
                          <option value="">Day</option>
                          {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select className={`${selectCls} flex-1`} value={form.dob_month} onChange={set("dob_month")}>
                          <option value="">Month</option>
                          {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                        </select>
                        <select className={`${selectCls} flex-1`} value={form.dob_year} onChange={set("dob_year")}>
                          <option value="">Year</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </Row>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      {success && <p className="text-sm text-teal-700">{success}</p>}
                      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                      <Button type="submit" disabled={isSaving} className="bg-teal-700 hover:bg-teal-800 text-white px-8">
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>

                  </div>

                  {/* Avatar - right column */}
                  <div className="w-44 flex flex-col items-center gap-3 py-8 px-4">
                    <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                      {avatarPreview
                        ? <img src={avatarPreview} alt="avatar" className="w-24 h-24 rounded-full object-cover border border-slate-200" />
                        : <div className="w-24 h-24 rounded-full bg-teal-700 flex items-center justify-center text-white"><FiUser size={40} /></div>
                      }
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <MdCameraAlt className="text-white text-xl" />
                      </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Select Image
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      Max 1 MB<br />JPG, PNG
                    </p>
                  </div>

                </div>

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable row: label on the left (fixed 160px, right-aligned), content fills right */
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-0">
      <Label className="w-40 shrink-0 text-right pr-5 text-slate-500 text-[15px] font-normal">{label}</Label>
      <div className="flex-1">{children}</div>
    </div>
  );
