"use client";

import { FiUser } from "react-icons/fi";

interface UserProfileCardProps {
  username?: string;
  email?: string;
  avatarUrl?: string | null;
}

export default function UserProfileCard({ username, email, avatarUrl }: UserProfileCardProps) {
  return (
    <div className="flex items-center gap-3">
      {avatarUrl
        ? <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
        : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-400">
            <FiUser size={18} />
          </div>
      }
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{username || "Username"}</p>
        <p className="text-xs text-slate-500 truncate">{email || "your@email.com"}</p>
      </div>
    </div>
  );
}
