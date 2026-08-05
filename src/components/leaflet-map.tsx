"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ProjectCity {
  city: string;
  lat: number;
  lng: number;
  count: string;
  productType: string;
  province: string;
}

const cities: ProjectCity[] = [
  { city: "Jakarta", lat: -6.2088, lng: 106.8456, count: "50+", productType: "PJU LED, Panel Surya", province: "DKI Jakarta" },
  { city: "Surabaya", lat: -7.2575, lng: 112.7521, count: "45+", productType: "PJU Tenaga Surya, Penangkal Petir", province: "Jawa Timur" },
  { city: "Bandung", lat: -6.9175, lng: 107.6191, count: "25+", productType: "Panel Surya, Baterai LiFePO4", province: "Jawa Barat" },
  { city: "Semarang", lat: -6.9666, lng: 110.4196, count: "20+", productType: "PJU LED, Penangkal Petir", province: "Jawa Tengah" },
  { city: "Medan", lat: 3.5952, lng: 98.6722, count: "15+", productType: "PJU Tenaga Surya, Panel Surya", province: "Sumatera Utara" },
  { city: "Makassar", lat: -5.1477, lng: 119.4327, count: "15+", productType: "PJU LED, Baterai LiFePO4", province: "Sulawesi Selatan" },
  { city: "Denpasar", lat: -8.6705, lng: 115.2126, count: "10+", productType: "PJU Tenaga Surya, Penangkal Petir", province: "Bali" },
  { city: "Yogyakarta", lat: -7.7956, lng: 110.3695, count: "10+", productType: "Panel Surya, PJU LED", province: "DI Yogyakarta" },
  { city: "Balikpapan", lat: -1.2654, lng: 116.8312, count: "8+", productType: "PJU LED, Panel Surya", province: "Kalimantan Timur" },
  { city: "Manado", lat: 1.4748, lng: 124.8421, count: "5+", productType: "Penangkal Petir, PJU LED", province: "Sulawesi Utara" },
  { city: "Palembang", lat: -2.9761, lng: 104.7754, count: "7+", productType: "PJU Tenaga Surya, Panel Surya", province: "Sumatera Selatan" },
  { city: "Jayapura", lat: -2.5916, lng: 140.6690, count: "3+", productType: "PJU LED, Baterai LiFePO4", province: "Papua" },
];

function createCustomIcon(isActive: boolean = false): L.DivIcon {
  const size = isActive ? 36 : 28;
  const ringSize = isActive ? 48 : 40;
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="position:relative;width:${ringSize}px;height:${ringSize}px;display:flex;align-items:center;justify-content:center;">
        ${isActive ? `<div style="position:absolute;width:${ringSize}px;height:${ringSize}px;border-radius:50%;background:rgba(5,150,105,0.25);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ""}
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);border:3.5px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.25),0 0 0 1px rgba(5,150,105,0.2);display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;">
          <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
    popupAnchor: [0, -ringSize / 2 - 4],
  });
}

interface LeafletMapProps {
  className?: string;
}

export default function LeafletMap({ className = "" }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Center map on central Indonesia (around Toraja/Makassar region coordinates)
    const map = L.map(mapRef.current, {
      center: [-2.2, 117.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 11,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      dragging: true,
      touchZoom: true,
    });

    mapInstanceRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Clean and clear default style layer
    const osmTileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 18,
    });

    // Light-mode modern CartoDB Positron
    const cartoDBTileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>',
      maxZoom: 18,
    });

    // Set CartoDB Positron as default layer for cleaner integration
    cartoDBTileLayer.addTo(map);

    // Layer selection control
    const baseLayers = {
      "OpenStreetMap": osmTileLayer,
      "Positron": cartoDBTileLayer,
    };
    L.control.layers(baseLayers, {}, { position: "topright" }).addTo(map);

    cities.forEach((cityData) => {
      const marker = L.marker([cityData.lat, cityData.lng], {
        icon: createCustomIcon(false),
      });

      const popupContent = `
        <div style="font-family:Inter,system-ui,-apple-system,sans-serif;min-width:190px;padding:4px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:30px;height:30px;border-radius:6px;background:linear-gradient(135deg,#059669,#10b981);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <div style="font-weight:700;color:#064e3b;font-size:13px;line-height:1.2;">${cityData.city}</div>
              <div style="font-size:10px;color:#8a8278;line-height:1.2;">${cityData.province}</div>
            </div>
          </div>
          <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:5px;">
            <span style="font-size:18px;font-weight:800;color:#059669;">${cityData.count}</span>
            <span style="font-size:10px;color:#8a8278;font-weight:500;">Proyek Selesai</span>
          </div>
          <div style="font-size:11px;color:#1f1a14;line-height:1.35;padding:5px 7px;background:#f0fdf4;border-radius:5px;border:1px solid #bbf7d0;">
            <strong style="color:#059669;">Produk:</strong> ${cityData.productType}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: "custom-popup",
        maxWidth: 240,
      });

      marker.on("mouseover", function () {
        this.setIcon(createCustomIcon(true));
      });

      marker.on("mouseout", function () {
        this.setIcon(createCustomIcon(false));
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, []);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border dark:border-gray-800 shadow-sm ${className}`}>
      <div ref={mapRef} className="w-full" style={{ height: "420px" }} />
    </div>
  );
}
