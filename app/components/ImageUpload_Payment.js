"use client";
import React, { useState } from "react";
import Image from "next/image";

const ImageUpload_Payment = ({
  onImageUpload,
  maxSizeMB = 5,
  label = "Upload Image",
  required = false,
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadStatus("Please select an image file");
        return;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadStatus(`File size should be less than ${maxSizeMB}MB`);
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus("Please upload the image");

      // Clean up the old preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setUploadStatus("Please select an image first");
      return;
    }

    setIsUploading(true);
    try {
      if (onImageUpload) {
        await onImageUpload(selectedImage);
      }
      setUploadStatus("Upload successful!");
    } catch (error) {
      setUploadStatus("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label">
        <span className="label-text font-medium">
          {label}
          {required && "*"}
        </span>
      </label>

      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input file-input-bordered w-full"
        />

        {previewUrl && (
          <div className="relative w-full h-48 mt-2">
            <Image
              src={previewUrl}
              alt="Image preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        )}

        {selectedImage && (
          <button
            className="btn btn-neutral"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </button>
        )}

        <div className="text-sm">
          {uploadStatus && (
            <span
              className={
                uploadStatus.includes("failed")
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {uploadStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload_Payment;
