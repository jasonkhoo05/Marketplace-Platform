"use client";

import { ChangeEvent } from "react";
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
    function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) return;

        const previewUrls = files.map((file) => URL.createObjectURL(file));

        onChange([...imageUrls, ...previewUrls]);
    }

    function removeImage(index: number) {
        onChange(imageUrls.filter((_, currentIndex) => currentIndex !== index));
    }

    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Images
            </label>

            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-teal-600 hover:bg-teal-50">
                <FiImage className="mb-2 text-teal-700" size={28} />
                <span className="text-sm font-medium text-slate-700">
                    Click to upload product images
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
                />
            </label>

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