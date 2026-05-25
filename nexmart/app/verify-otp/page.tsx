"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import "./verity-otp.css"

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");

    useEffect(() => {
        if (!email) {
            setError("Missing email. Please enter your email address.");
        }
    }, [email]);

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError("Missing email. Please enter your email address.");
            return;
        }

        const supabase = createClient();

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "recovery",
        });

        if (error) {
            setError(error.message);
            return;
        }

        setSuccess(true);

        setTimeout(() => {
            router.push("/reset-password");
        }, 2000);
    };

    return (
        <div className="otp-container">
            <div className="otp-panel">
                <div className="otp-box">

                    <h2>Verify OTP</h2>

                    <p className="otp-subtitle">
                        Enter the OTP sent to your email
                    </p>

                    {success && (
                        <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
                            <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                            <AlertTitle>Verification Successful</AlertTitle>
                            <AlertDescription>
                                Your OTP has been verified. Redirecting you shortly...
                            </AlertDescription>
                        </Alert>
                    )}

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
                            className="otp-submit"
                        >
                            Verify OTP
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}