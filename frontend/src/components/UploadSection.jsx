import React, { useState } from "react";
import { uploadOcr } from "../services/api";

const UploadSection = ({ setAnswer }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await uploadOcr(file);
      setAnswer(data.text);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
        {loading ? "Scanning..." : "📸 Upload Image"}
        <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
      </label>
    </div>
  );
};

export default UploadSection;
