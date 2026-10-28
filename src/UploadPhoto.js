import React, { useState } from "react";
import { motion } from "framer-motion";
import "./UploadPhoto.css";
import bg from "./bgsign.png";

export default function UploadPhoto() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      console.warn("No file selected");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleGenerateResult = async () => {
    if (!image) return alert("Please upload an image first!");

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        alert("Prediction failed.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    }

    setLoading(false);
  };

  return (
    <div
      className="upload-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <motion.div
        className="upload-card"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="upload-title">Upload Your Food Image</h2>

        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <div className="upload-box">
            <p>Click below to upload</p>
          </div>
        )}

        <label className="upload-btn">
          Choose Photo
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
        </label>

        {image && (
          <button className="generate-btn" onClick={handleGenerateResult}>
            {loading ? "Processing..." : "Generate Result"}
          </button>
        )}

        {result && (
          <div className="result-box">
            <h3>Prediction Result</h3>
            <p><strong>Food:</strong> {result.food}</p>
            <p><strong>Calories:</strong> {result.calories}</p>
            <p><strong>Protein:</strong> {result.protein} g</p>
            <p><strong>Carbs:</strong> {result.carbohydrates} g</p>
            <p><strong>Fat:</strong> {result.fat} g</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
