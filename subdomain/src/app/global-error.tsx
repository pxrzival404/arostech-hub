"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              padding: "2rem",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                fontSize: 24,
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              Terjadi Kesalahan
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginBottom: "1.5rem",
                lineHeight: 1.5,
              }}
            >
              Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.
            </p>
            {error?.message && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  wordBreak: "break-all",
                }}
              >
                {error.message}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "#059669",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
