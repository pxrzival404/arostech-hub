import fs from 'fs';
import path from 'path';

/**
 * Generates the DNS TXT verification record value.
 * Typically the value is "google-site-verification=<verification_code>"
 */
export function getDnsTxtRecord(code?: string): string | null {
  const cleanCode = code || process.env.GSC_VERIFICATION_CODE;
  if (!cleanCode) return null;
  
  if (cleanCode.startsWith('google-site-verification=')) {
    return cleanCode;
  }
  return `google-site-verification=${cleanCode}`;
}

/**
 * Creates the static google{code}.html file in the public directory
 * for HTML verification.
 */
export function writeHtmlVerificationFile(code?: string): string | null {
  const cleanCode = code || process.env.GSC_VERIFICATION_CODE;
  if (!cleanCode) {
    // Only warn during build time if they expect to use HTML verification
    if (process.env.NODE_ENV === 'production') {
      console.warn('Warning: GSC_VERIFICATION_CODE is not defined in production. Skipping HTML verification file generation.');
    }
    return null;
  }

  // Extract the code without google prefix or .html extension if present
  // e.g., "google12345.html" -> "12345", "12345" -> "12345"
  let parsedCode = cleanCode.replace(/^google/, '').replace(/\.html$/, '');
  
  const filename = `google${parsedCode}.html`;
  const publicDir = path.join(process.cwd(), 'public');
  const filePath = path.join(publicDir, filename);

  const fileContent = `google-site-verification: google${parsedCode}.html`;

  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`[GSC] Generated HTML verification file at: public/${filename}`);
    return filePath;
  } catch (error) {
    console.error(`[GSC] Failed to write HTML verification file:`, error);
    throw error;
  }
}
