"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { companyInfo } from "@/data/company";

export function ContactBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Butuh Solusi PJU untuk Proyek Anda?
        </h2>
        <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">
          Tim kami siap membantu Anda dari konsultasi hingga instalasi. Hubungi
          kami untuk mendapatkan penawaran terbaik.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold"
            asChild
          >
            <a
              href={`https://wa.me/${companyInfo.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 size-5" />
              Hubungi via WhatsApp
            </a>
          </Button>
          <Button
            size="lg"
            className="bg-transparent border-2 border-white/60 text-white hover:bg-white/15 hover:border-white"
            asChild
          >
            <a href={`tel:${companyInfo.contactPhone.replace(/\s/g, "")}`}>
              <Phone className="mr-2 size-5" />
              Telepon Kami
            </a>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
