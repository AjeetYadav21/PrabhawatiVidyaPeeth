"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Upload failed.");
        return;
      }

      onChange(result.url);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="admin-image-upload">
      <span>{label}</span>
      {value ? (
        <div className="admin-image-preview">
          <img src={value} alt={label} />
        </div>
      ) : null}

      <div className="admin-image-meta">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/images/... or uploaded file URL"
        />
        <div className="admin-button-row">
          <label className="admin-button admin-upload-button">
            {uploading ? "Uploading..." : "Upload Image"}
            <input type="file" accept="image/*" onChange={handleFileChange} hidden disabled={uploading} />
          </label>
        </div>
        {error ? <div className="admin-status error">{error}</div> : null}
      </div>
    </div>
  );
}
