import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isSupabaseConfigured } from "./supabase/project-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = isSupabaseConfigured();
