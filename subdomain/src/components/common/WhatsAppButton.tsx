"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { companyInfo } from "@/data/company";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}

export function WhatsAppButton({
  message = "Halo, saya ingin bertanya tentang produk PJU",
  className,
  variant = "default",
  size = "default",
  label = "Hubungi via WhatsApp",
}: WhatsAppButtonProps) {
  const waUrl = `https://wa.me/${companyInfo.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Button variant={variant} size={size} className={className} asChild>
      <a href={waUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="size-4" />
        {label}
      </a>
    </Button>
  );
}
