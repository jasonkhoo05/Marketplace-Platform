"use client";

import { TbBrandAppgallery } from "react-icons/tb";
import { useState } from "react";

import "./login.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to send reset email.");
                return;
            }

            setMessage("Password reset email sent. Please check your inbox.");
        } catch {
            setError("Something went wrong.");
        }
    };

    
}