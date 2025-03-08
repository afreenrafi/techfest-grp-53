"use client";

import { useState } from "react";

export default function Page() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [factCheck, setFactCheck] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  // Handle Upload & API Call
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
      setText(data.extractedText || "No text extracted.");
      setFactCheck(data.factCheckResults || []);
    } catch (error) {
      console.error("Error:", error);
      setText("Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">OCR + Fact Check</h1>

      {/* File Upload */}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} className="mt-2 p-2 bg-blue-500 text-white rounded">
        {loading ? "Processing..." : "Extract & Verify"}
      </button>

      {/* Display Extracted Text */}
      {text && (
        <div className="mt-4">
          <h2 className="font-bold">Extracted Text:</h2>
          <p>{text}</p>
        </div>
      )}

      {/* Display Fact Check Results */}
      {factCheck.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold">Fact Check Results:</h2>
          {factCheck.map((claim, index) => (
            <div key={index} className="border p-2 mt-2">
              <p><strong>Claim:</strong> {claim.text}</p>
              {claim.claimReview?.map((review: any, i: number) => (
                <div key={i}>
                  <p><strong>Fact Source:</strong> {review.publisher.name}</p>
                  <p><strong>Verdict:</strong> {review.textualRating}</p>
                  <a href={review.url} target="_blank" className="text-blue-600">Read More</a>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
