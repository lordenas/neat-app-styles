// Roboto Regular - subset for Cyrillic + Latin
// This module exports a base64-encoded TTF to be used with jsPDF
// We'll fetch it at runtime from Google Fonts CDN to keep bundle small

let cachedFont: string | null = null;

export async function getCyrillicFont(): Promise<string> {
  if (cachedFont) return cachedFont;
  
  // Fetch Roboto Regular TTF from Google Fonts
  const response = await fetch(
    "https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbGmT.ttf"
  );
  const buffer = await response.arrayBuffer();
  
  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  cachedFont = btoa(binary);
  return cachedFont;
}
