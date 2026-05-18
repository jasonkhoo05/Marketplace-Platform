"use client";

import { TbBrandAppgallery } from "react-icons/tb";
import { useState, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import GoogleAuthButton from "@/components/ui/google-auth-button";
import "./login.css";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.signOut().catch(() => {});
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.status === 404) {
                router.push("/signup");
                return;
            }

            if (!response.ok) {
                setError(data.error || "Login failed");
                return;
            }

            if (data.redirectTo) {
                router.push(data.redirectTo);
            } else {
                router.push("/products"); // Fallback safety
            }
            // router.push("/admin/dashboard");

            // router.push("seller/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email.")
            return;
        }

        setIsResetting(true); 
        setError(null);

        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: '/reset-password',
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        } else {
            setIsLoading(false);
            setToast(true);

            setTimeout(() => {
                setToast(false);
                router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
            }, 1200);                                           
        }

        setIsLoading(false);
    };

    return (
        <div className="page-login">                         
            {toast && (                                     
                <div className="redirecting-card">
                    <p>Redirecting...</p>
                </div>
            )}

            <div className="login-container">
                <div className="leftPanel">
                    <div className="logo">
                        <TbBrandAppgallery className="logoIcon" />
                        <span>NexMart</span>
                    </div>

                    <div className="content-left">
                        <p className="welcome">WELCOME BACK</p>

                        <h1>
                            <span className="line1">Shop smarter.</span>
                            <br />
                            <span className="line2">Live better.</span>
                        </h1>

                        <p className="description">
                            Join thousands of happy shoppers who trust NexMart for their everyday needs
                            - from daily essentials to weekend finds.
                        </p>
                    </div>
                </div>

                <div className="rightPanel">
                    <div className="formBox">
                        <h2>Login your account</h2>

                        <p className="subtitle">
                            It's good to have you back. Let's continue your journey
                        </p>

                        <form onSubmit={handleLogin}>
                            <label>Email address</label>
                            <input
                                type="email"
                                placeholder="you@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="passwordTop">
                                <label>Password</label>
                                <span
                                    className="forgotPasswordBtn"
                                    onClick={handleForgotPassword}
                                    style={{ cursor: "pointer" }}
                                >
                                    Forgot password?
                                </span>
                            </div>

                            <div className="passwordInputBox">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <span
                                    className="eyeIcon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible />
                                    ) : (
                                        <AiOutlineEye />
                                    )}
                                </span>
                            </div>

                            {error && (
                                <p style={{ color: "red", fontSize: "13px", marginTop: "10px" }}>
                                    {error}
                                </p>
                            )}

                            <button type="submit" className="signinButton" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <GoogleAuthButton />

                        <p className="signupText">
                            Don't have an account?{" "}
                            <a href="/signup">Create one - it's free</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}