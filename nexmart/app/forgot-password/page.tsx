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
        <div className="otp-container">
            <div className="otpCard">
                <h2>Verify OTP</h2>

                <p className="subtitle">
                    Fill in OTP
                </p>

                <form onSubmit={handleVerifyOtp}>
                    <input
                        type="text"
                        placeholder="OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />

                    {error && (
                        <p
                            style={{
                                color: "red",
                                fontSize: "13px",
                                marginTop: "10px",
                            }}
                        >
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
    );
}