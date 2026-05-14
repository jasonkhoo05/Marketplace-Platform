"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import "./login.css";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
    };

    return (
        <div className="login-container">
            <div className="rightPanel">
                <div className="formBox">
                    <h2>Reset Password</h2>
                    <p className="subtitle">Enter your email to reset your password</p>
                    <form>
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit" className="signinButton">Reset Password</button>
                    </form>
                    <div className="links">
                        <Link href="/login">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}       




