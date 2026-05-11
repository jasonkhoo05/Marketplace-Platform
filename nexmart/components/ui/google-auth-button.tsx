"use client";

import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/lib/supabase/client";

export default function GoogleAuthButton() {
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "http://localhost:3000/auth/callback",
                queryParams: {
                    prompt: "select_account",
                },
            },
        });
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            className="googleButton"
        >
            <FcGoogle size={22} />
            <span>Continue with Google</span>
        </button>
    );
}