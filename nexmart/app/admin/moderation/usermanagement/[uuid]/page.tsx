"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, User as UserIcon } from "lucide-react";
import { Address, User, UserDetails } from "../../../types/users";


export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const[showImage, setShowImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [uuid]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/admin/users/${uuid}`);
      if (!res.ok) throw new Error("User not found.");
      const data = await res.json();
      setUser(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load user.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${uuid}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user.");
      router.push("/admin/moderation/usermanagement");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete user.");
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading user details...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 text-sm text-rose-600">
        {errorMessage || "User not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={deleteUser}
          className="flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
        >
          <Trash2 className="w-4 h-4" />
          Delete User
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
            onClick={() => user.user_image && setShowImage(true)}
          >
            {user.user_image ? (
                <img src={user.user_image} className="h-14 w-14 rounded-full object-cover" />
            ) : (
                <UserIcon className="w-6 h-6 text-gray-500" />
            )}
          </div>

          {showImage && user.user_image && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setShowImage(false)}
              >
                <img
                  src={user.user_image}
                  className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain"
                />
            </div>
          )

          }
          <div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>



        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <DetailRow label="User UUID" value={user.user_uuid} />
          <DetailRow label="Phone" value={user.phone || "Not Provided"} />
          <DetailRow label="Gender" value={user.gender || "Not Provided"} />
          <DetailRow label="Date of Birth" value={user.date_of_birth || "Not Provided"} />
          <DetailRow label="Last Active Role" value={user.last_active_role || "Unknown"} />
          <DetailRow
              label="Last Sign In"
              value={user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString("en-MY")
                  : "Never"}
          />
        </div>

        <div>
          <h3 className="font-semibold text-base mb-2">Roles</h3>
          <div className="flex flex-wrap gap-2">
          {(user.roles ?? []).length > 0 ? (
            (user.roles ?? []).map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-700"
                >
                  {role}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No roles found.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-2">Address</h3>
          {user.address.length > 0 ? (
            <div className="space-y-3">
              {user.address.map((a, i) => (
                <div key={i} className="rounded-2xl border p-4 text-sm bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{a.address_line}</p>
                    {a.is_default && (
                      <span className="text-xs rounded-full bg-green-100 text-green-700 px-3 py-1">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{a.city}, {a.postcode}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No address found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
    </div>
  );
}