/**
 * Input Sanitization Utilities
 *
 * Menyediakan fungsi-fungsi untuk membersihkan input pengguna
 * sebelum disimpan ke database, mencegah XSS, header injection,
 * dan input yang tidak valid.
 */

/**
 * Hapus HTML tags dan karakter berbahaya dari string.
 * Trim whitespace, batasi panjang, dan escape karakter khusus.
 */
export function sanitizeString(
  input: unknown,
  maxLength: number = 255
): string {
  if (input === null || input === undefined) return "";

  let str = String(input);

  // Trim whitespace
  str = str.trim();

  // Hapus HTML tags (XSS prevention)
  str = str.replace(/<[^>]*>/g, "");

  // Escape karakter yang bisa dipakai untuk script injection
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  // Batasi panjang string
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str;
}

/**
 * Sanitasi string untuk penggunaan aman di HTTP header
 * (misalnya Content-Disposition filename).
 * Hanya izinkan alphanumeric, dash, underscore, dot, dan spasi.
 */
export function sanitizeForHeader(input: unknown, maxLength: number = 100): string {
  if (input === null || input === undefined) return "untitled";

  let str = String(input).trim();

  // Hanya izinkan karakter aman: alphanumeric, dash, underscore, dot, spasi
  str = str.replace(/[^a-zA-Z0-9\-_.\s]/g, "");

  // Ganti spasi berurutan dengan satu spasi, lalu ganti spasi dengan dash
  str = str.replace(/\s+/g, "-");

  // Hapus dash berurutan
  str = str.replace(/-+/g, "-");

  // Trim dash dari awal dan akhir
  str = str.replace(/^-+|-+$/g, "");

  // Batasi panjang
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  // Jika kosong setelah sanitasi, gunakan fallback
  return str || "untitled";
}

/**
 * Validasi format email.
 * Menggunakan regex sederhana yang cukup untuk validasi dasar.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validasi dan clamp angka ke rentang yang ditentukan.
 * Mengembalikan defaultValue jika input bukan angka valid.
 */
export function sanitizeNumber(
  input: unknown,
  min: number,
  max: number,
  defaultValue: number
): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Parse string ke integer dengan aman.
 * Mengembalikan defaultValue jika hasilnya NaN.
 */
export function safeParseInt(
  input: string | null | undefined,
  defaultValue: number
): number {
  if (!input) return defaultValue;
  const parsed = parseInt(input, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Sanitasi data klien RFQ.
 * Membersihkan semua field string dan memastikan format yang benar.
 */
export function sanitizeClientData(clientData: Record<string, unknown>) {
  return {
    companyName: sanitizeString(clientData.companyName, 200),
    companyContactPerson: sanitizeString(clientData.companyContactPerson, 150),
    companyEmail: isValidEmail(String(clientData.companyEmail || ""))
      ? String(clientData.companyEmail).trim()
      : "",
    companyAddress: sanitizeString(clientData.companyAddress, 500),
    clientName: sanitizeString(clientData.clientName, 150),
    email: isValidEmail(String(clientData.email || ""))
      ? String(clientData.email).trim()
      : "",
    phone: sanitizeString(clientData.phone, 30),
    shippingCity: sanitizeString(clientData.shippingCity, 100),
    shippingAddress: sanitizeString(clientData.shippingAddress, 500),
  };
}

/**
 * Sanitasi item RFQ.
 * Membersihkan field string dan memastikan quantity valid.
 */
export function sanitizeRFQItem(
  item: Record<string, string | number>,
  maxQuantity: number = 99999
) {
  return {
    productId: sanitizeString(item.productId, 100),
    productName: sanitizeString(item.productName, 200),
    subcategory: sanitizeString(item.subcategory, 100),
    quantity: sanitizeNumber(item.quantity, 1, maxQuantity, 1),
  };
}

// === Konstanta Validasi RFQ ===

/** Maksimal jumlah item per RFQ */
export const MAX_RFQ_ITEMS = 50;

/** Maksimal quantity per item */
export const MAX_ITEM_QUANTITY = 99999;

/** Maksimal panjang folder name */
export const MAX_FOLDER_NAME_LENGTH = 200;
