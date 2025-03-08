"use client";
import { useState } from "react";

export default function ImageUploader() {
    const [images, setImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const uploadFile = async (file: File) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/cloudvision", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            setImages((prev) => [...prev, data.url]); // Store image URL
        } else {
            setError(data.error);
        }

        setLoading(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files).filter(file =>
            file.type.startsWith("image/")
        );

        if (files.length === 0) {
            setError("Only image files are allowed!");
            return;
        }

        files.forEach(uploadFile);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const files = Array.from(event.target.files).filter(file =>
            file.type.startsWith("image/")
        );

        if (files.length === 0) {
            setError("Only image files are allowed!");
            return;
        }

        files.forEach(uploadFile);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="w-96 h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 bg-white rounded-lg cursor-pointer hover:border-blue-500 transition-all"
            >
                <p className="text-gray-600">Drag & Drop images here</p>
                <p className="text-gray-400 text-sm">or</p>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileInput"
                />
                <label htmlFor="fileInput" className="px-4 py-2 bg-blue-500 text-white rounded mt-2 cursor-pointer hover:bg-blue-600">
                    Click to Upload
                </label>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {loading && <p className="text-blue-500 mt-2">Uploading...</p>}

            <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((url, index) => (
                    <img key={index} src={url} alt="Uploaded Preview" className="w-24 h-24 object-cover rounded" />
                ))}
            </div>
        </div>
    );
}
