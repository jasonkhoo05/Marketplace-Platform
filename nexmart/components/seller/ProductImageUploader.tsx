"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FiImage, FiX } from "react-icons/fi";
import { Progress } from "@/components/ui/progress";

interface ProductImageUploaderProps {
    imageUrls: string[];
    onChange: (imageUrls: string[]) => void;
    error?: string;
}

export default function ProductImageUploader({
    imageUrls,
    onChange,
    error,
}: ProductImageUploaderProps) {
    const imageUrlsRef = useRef(imageUrls);
    imageUrlsRef.current = imageUrls;
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!uploading) {
            setUploadProgress(100);
            return;
        }
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
        }, 150);
        return () => clearInterval(interval);
    }, [uploading]);

    async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        setUploadError(null);
        setUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const previewUrl = URL.createObjectURL(file);
            const insertIndex = imageUrlsRef.current.length;
            onChange([...imageUrlsRef.current, previewUrl]);

            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                if (res.ok) {
                    const { url } = await res.json();
                    URL.revokeObjectURL(previewUrl);
                    const updated = [...imageUrlsRef.current];
                    updated[insertIndex] = url;
                    onChange(updated);
                } else {
                    const data = await res.json().catch(() => ({}));
                    setUploadError(data.error ?? "Upload failed. Please try again.");
                    onChange(imageUrlsRef.current.filter((_, j) => j !== insertIndex));
                    URL.revokeObjectURL(previewUrl);
                }
            } catch {
                setUploadError("Upload failed. Please check your connection and try again.");
                onChange(imageUrlsRef.current.filter((_, j) => j !== insertIndex));
                URL.revokeObjectURL(previewUrl);
            }

        }

        setUploading(false);
    }

    function removeImage(index: number) {
        onChange(imageUrls.filter((_, currentIndex) => currentIndex !== index));
    }

    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Images
            </label>

            <label className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${uploading ? "border-teal-400 bg-teal-50 opacity-70 cursor-not-allowed" : "border-slate-300 bg-slate-50 hover:border-teal-600 hover:bg-teal-50"}`}>
                <FiImage className="mb-2 text-teal-700" size={28} />
                <span className="text-sm font-medium text-slate-700">
                    {uploading ? "Uploading…" : "Click to upload product images"}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                    Multiple images are supported
                </span>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                />
            </label>

            {uploading && (
                <div className="mt-3">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="mt-1 text-xs text-slate-500 text-right">{uploadProgress}%</p>
                </div>
            )}

            {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            {imageUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {imageUrls.map((imageUrl, index) => (
                        <div
                            key={`${imageUrl}-${index}`}
                            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200"
                        >
                            <img
                                src={imageUrl}
                                alt={`Product preview ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-red-500 shadow hover:bg-red-50"
                                aria-label="Remove image"
                            >
                                <FiX size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
