"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import "./login.css";

export default function VerityOtpPage() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        const supabase = createClient();

        const { error } = await supabase.auth.verifyOtp({
            email: email!,
            token: otp,
            type: "email",
        });

        if (error) {
            setError(error.message);
            return;
        }

        router.push("/reset-password");
    };
}