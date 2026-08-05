"use client";

import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowRight, Lightbulb, Sun, Cpu, Battery, BatteryCharging, Zap, Shield, Plug } from "lucide-react";

// Per-subdomain subcategory icons — falls back to subdomain default icon
const subcategoryIcons: Record<string, React.ElementType> = {
  // PJU subcategories
  "PJU LED": Lightbulb,
  "PJU Tenaga Surya": Sun,
  "Smart PJU": Cpu,
  // Baterai subcategories
  "baterai-12v": Battery,
  "ups": Plug,
  "battery-charger": BatteryCharging,
  // Solar Panel subcategories
  "solarpanel-kecil": Sun,
  "solarpanel-besar": Sun,
  "solar-charge-controller": Plug,
  // Penangkal Petir subcategories
  "kurn": Shield,
  "viking": Shield,
  "erico": Shield,
  "lpi-guardian": Shield,
  "thomas": Shield,
  "ef": Shield,
  "aksesoris-petir": Zap,
};

// Default icon per subdomain
const subdomainDefaultIcons: Record<string, React.ElementType> = {
  pju: Lightbulb,
  baterai: Battery,
  solarpanel: Sun,
  penangkalpetir: Shield,
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const Icon = subcategoryIcons[product.subcategory] || subdomainDefaultIcons[product.category] || Lightbulb;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 py-0 gap-0">
      {/* Image (dari Sanity) atau fallback icon */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 && product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Icon className="size-16 text-emerald-300 dark:text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs">
            {product.subcategory}
          </Badge>
        </div>
      </div>

      <CardHeader className="px-5 pt-5 pb-0">
        <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {product.name}
        </h3>
      </CardHeader>

      <CardContent className="px-5 pt-3 pb-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.highlights.slice(0, 2).map((highlight) => (
            <span
              key={highlight}
              className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full"
            >
              {highlight}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4">
        <Button
          variant="ghost"
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-0 h-auto font-semibold"
          asChild
        >
          <Link href={`/products/${product.slug}`}>
            Lihat Detail
            <ArrowRight className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
