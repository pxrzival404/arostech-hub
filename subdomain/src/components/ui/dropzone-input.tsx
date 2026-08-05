"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X } from "lucide-react";

interface DropzoneInputProps {
  /** Accepted file types (MIME), e.g. "image/png,image/jpeg,image/webp" */
  accept?: string;
  /** Callback when a file is selected (via click or drag-and-drop) */
  onFileSelect: (file: File | null) => void;
  /** Optional preview URL for the currently selected file */
  preview?: string | null;
  /** Called when the user clears the preview */
  onClearPreview?: () => void;
  /** Hint text shown below the dropzone */
  hint?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * DropzoneInput — reusable file upload with drag-and-drop support.
 *
 * Usage:
 * ```tsx
 * <DropzoneInput
 *   accept="image/png,image/jpeg"
 *   onFileSelect={(file) => setFile(file)}
 *   preview={previewUrl}
 *   onClearPreview={() => setPreview(null)}
 *   hint="Upload gambar (PNG/JPG)"
 * />
 * ```
 */
export function DropzoneInput({
  accept,
  onFileSelect,
  preview,
  onClearPreview,
  hint,
  className = "",
}: DropzoneInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      if (file && accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        if (!acceptedTypes.includes(file.type)) {
          return; // Ignore non-matching file types
        }
      }
      onFileSelect(file);
    },
    [accept, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0] || null;
      handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFile(file);
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileSelect(null);
    onClearPreview?.();
  }, [onFileSelect, onClearPreview]);

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed
          p-6 text-center cursor-pointer transition-colors
          ${
            isDragOver
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
              : "border-muted-foreground/25 bg-muted/30 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-20 w-auto object-contain rounded"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5 hover:bg-destructive/80 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <>
            <Upload
              className={`size-8 ${
                isDragOver
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragOver ? "Lepaskan file di sini" : "Klik atau seret file ke sini"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Pilih file dari folder atau drag & drop
              </p>
            </div>
          </>
        )}
      </div>
      {hint && !preview && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
