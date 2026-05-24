"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import "./reset-password.css";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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

        setSuccess(true);

        setTimeout(() => {
            router.push("/login");
        }, 2000);
    };

    return (
        <div className="page-reset">
            <div className="reset-container">
                <div className="reset-panel">

                    <div className="reset-box">
                        <h2>Reset Password</h2>
                        <p className="reset-subtitle">Create a new secure password</p>

                        {success && (
                            <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
                                <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                                <AlertTitle>Password Reset Successful</AlertTitle>
                                <AlertDescription>
                                    Your password has been updated. Redirecting to login...
                                </AlertDescription>
                            </Alert>
                        )}
                        
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