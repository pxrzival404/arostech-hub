"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Flex,
  Stack,
  Text,
  Button,
  Spinner,
} from "@sanity/ui";
import { set } from "sanity";
import { FileText, List } from "lucide-react";

/**
 * Custom Sanity input component for Product Specification PDF
 * Auto-generates PDF from technical specifications data.
 */
export function SpecificationPdfInput(props: any) {
  const {
    value = "",
    onChange,
    parent,
  } = props;

  const specifications = parent?.specifications || [];
  const productName = parent?.name || "";
  const subcategory = parent?.subcategory || "";

  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Generate PDF from specs
  const handleGeneratePdf = useCallback(async () => {
    if (!productName) {
      setStatusMessage("Simpan nama produk terlebih dahulu");
      return;
    }

    setGenerating(true);
    setStatusMessage("Membuat PDF...");

    try {
      const res = await fetch("/api/admin/spec-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          subcategory,
          method: "from-specs",
          specifications,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onChange(set(data.fileUrl));
        setStatusMessage(`PDF berhasil dibuat: ${data.filename} (${Math.round(data.size / 1024)} KB)`);
      } else {
        setStatusMessage(`Gagal: ${data.error}`);
      }
    } catch (err) {
      setStatusMessage("Gagal membuat PDF. Coba lagi.");
    } finally {
      setGenerating(false);
    }
  }, [productName, subcategory, specifications, onChange]);

  // Auto-generate when specs change
  useEffect(() => {
    if (specifications.length > 0 && productName) {
      const timer = setTimeout(() => {
        handleGeneratePdf();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [specifications, productName, handleGeneratePdf]);

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} tone="transparent" border>
        <Flex direction="column" gap={3}>
          {/* Method info */}
          <Box>
            <Text size={1} weight="medium" style={{ color: "#059669" }}>
              Mode: Dari Spesifikasi — PDF di-generate otomatis dari data spesifikasi teknis
            </Text>
          </Box>

          {/* Generate button */}
          <Box>
            <Text size={1} muted>
              PDF akan otomatis di-generate dari data Spesifikasi Teknis di atas.
              Klik tombol untuk generate ulang jika ada perubahan.
            </Text>
            <Button
              mode="default"
              tone="positive"
              onClick={handleGeneratePdf}
              disabled={generating || specifications.length === 0}
              style={{ marginTop: 8 }}
              icon={generating ? <Spinner /> : <List />}
              text={generating ? "Membuat PDF..." : "Generate/Update PDF dari Spesifikasi"}
            />
          </Box>

          {/* Status message */}
          {statusMessage && (
            <Card padding={2} radius={1} tone={statusMessage.startsWith("Gagal") ? "critical" : "positive"}>
              <Text size={1}>{statusMessage}</Text>
            </Card>
          )}

          {/* Current file URL */}
          {value && (
            <Card padding={2} radius={1} tone="transparent" border>
              <Flex align="center" gap={2}>
                <FileText size={16} style={{ color: "#059669" }} />
                <Text size={1}>
                  File saat ini:{" "}
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#059669", textDecoration: "underline" }}
                  >
                    {value}
                  </a>
                </Text>
              </Flex>
            </Card>
          )}
        </Flex>
      </Card>
    </Stack>
  );
}
