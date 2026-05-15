"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            router.push("/login"); 
        }

        setIsLoading(false);
    };

    return (
        <div className="login-container">
            <div className="rightPanel">
                <div className="formBox">
                    <h2>Reset Password</h2>
                    <p className="subtitle">Enter your email</p>
                    <form onSubmit={handleSubmit}>
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
                        <button type="submit" className="signinButton" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                    <div className="links">
                        <Link href="/login">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
