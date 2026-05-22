"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import "./reset-password.css";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        router.push("/login");
    };

    return (
        <div className="page-reset">
            <div className="reset-container">
                <div className="reset-panel">

                    <div className="reset-box">
                        <h2>Reset Password</h2>
                        <p className="reset-subtitle">Create a new secure password</p>

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
                                placeholder="Confirm password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                            
                            {error && (
                                <p className="errorMessage">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="reset-submit"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Updating..."
                                    : "Reset Password"}
                            </button>

                        </form>

                        <div className="links">
                            <Link href="/login">
                                Back to Login
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}