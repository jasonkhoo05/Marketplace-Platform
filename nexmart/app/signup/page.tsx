"use client"

import { TbBrandAppgallery } from "react-icons/tb";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useRouter } from "next/navigation";
import "./signup.css";
import GoogleAuthButton from "@/components/ui/google-auth-button";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return "Password must be at least 8 characters.";
        if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
        return null;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        const pwdError = validatePassword(password);
        if (pwdError) {
            setError(pwdError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Sign up failed");
                return;
            }

            router.push("/login");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-container">

                <div className="leftPanel">
                    <div className="logo">
                        <div className="grad" style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "white" }}>N</div>
                        <span>NexMart</span>
                    </div>

                <div className="content-left">
                    <p className="welcome">STEP INTO NEXMART</p>

                    <h1>
                        <span className="line1">Smart shopping.</span>
                        <br />
                        <span className="line2">Made simple.</span>
                    </h1>

                    <p className="description">
                        Join NexMart and discover a smoother way to shop essentials, deals
                        and everyday favorites.
                    </p>
                 </div>
            </div>

            <div className="rightPanel">
                <div className="formBox">
                    <h2>Sign up your account</h2>

                    <p className="subtitle">
                        Good to have your back. Pick up right where you left off.
                    </p>

                    <form onSubmit={handleSignup}>
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="your_username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

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

                        <button type="submit" className="signupButton" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Sign up"}
                        </button>
                    </form>

                    <GoogleAuthButton />
                    
                    <p className="loginText">
                        Already have an account?{" "}
                        <a href="/login"> Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
