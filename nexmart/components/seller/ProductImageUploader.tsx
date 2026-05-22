"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FiImage, FiX } from "react-icons/fi";

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
    const [uploading, setUploading] = useState(false);

    async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        setUploadError(null);
        setUploading(true);

        for (const file of files) {
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
                    onChange(imageUrlsRef.current.filter((_, i) => i !== insertIndex));
                    URL.revokeObjectURL(previewUrl);
                }
            } catch {
                setUploadError("Upload failed. Please check your connection and try again.");
                onChange(imageUrlsRef.current.filter((_, i) => i !== insertIndex));
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

            {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                    {imageUrls.map((imageUrl, index) => (
                        <div
                            key={`${imageUrl}-${index}`}
                            className="relative overflow-hidden rounded-xl border border-slate-200"
                        >
                            <img
                                src={imageUrl}
                                alt={`Product preview ${index + 1}`}
                                className="h-24 w-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50"
                                aria-label="Remove image"
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}