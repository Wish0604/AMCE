import React, { useState } from "react";
import { uploadOcr } from "../services/api";

const UploadSection = ({ setAnswer, language = "en-US" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await uploadOcr(file);
      if (result.text) {
        setAnswer(result.text);
      } else {
        setError("Failed to extract text from image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium inline-block">
        {loading ? "📸 Scanning..." : "📸 Upload Image"}
        <input
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept="image/*"
          disabled={loading}
        />
      </label>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
};

export default UploadSection;

