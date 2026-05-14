"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import "./login.css";

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");

    useEffect(() => {
        if (!email) {
            setError("Missing email. Please restart login process.");
        }
    }, [email]);

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError("Missing email. Please restart login process.");
            return;
        }

        const supabase = createClient();

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "email",
        });

        if (error) {
            setError(error.message);
            return;
        }

        router.push("/reset-password");
    };

    return (
        <div className="login-container">
            <div className="rightPanel">
                <div className="formBox">

                    <h2>Verify OTP</h2>

                    <p className="subtitle">
                        Enter the OTP sent to your email
                    </p>

                    <form onSubmit={handleVerifyOtp}>
                        <label>OTP Code</label>

                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />

                        {error && (
                            <p style={{ color: "red", fontSize: "13px" }}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="signinButton"
                        >
                            Verify OTP
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}