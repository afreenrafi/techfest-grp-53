"use client";

import { useState } from "react";

export default function Page() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("/api/cloudvision", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setText(data.text || "No text extracted.");
    } catch (error) {
      console.error("Error:", error);
      setText("Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">OCR Image Upload</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} className="mt-2 p-2 bg-blue-500 text-white rounded">
        {loading ? "Processing..." : "Extract Text"}
      </button>

      {text && (
        <div className="mt-4">
          <h2 className="font-bold">Extracted Text:</h2>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}
