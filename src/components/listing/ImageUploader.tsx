"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value, onChange, maxFiles = 8 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (value.length + accepted.length > maxFiles) return;
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of accepted) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload/image", { method: "POST", body: formData });
        const { url } = await res.json();
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: maxFiles - value.length,
    disabled: value.length >= maxFiles || uploading,
  });

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400",
          (value.length >= maxFiles || uploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {uploading ? "Загрузка..." : isDragActive ? "Отпустите файлы" : "Перетащите или кликните для загрузки"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {value.length}/{maxFiles} фото, до 4 МБ каждое
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image src={url} alt={`Фото ${i + 1}`} fill className="object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  Главное
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
