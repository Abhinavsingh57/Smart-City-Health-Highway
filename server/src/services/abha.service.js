const { v4: uuidv4 } = require('uuid');

/**
 * Generates a realistic ABHA ID (Ayushman Bharat Health Account)
 * Format: XX-XXXX-XXXX-XXXX (14 digits grouped)
 * Based on NHA ABHA ID format
 */
const generateAbhaId = () => {
  // Generate 14 random digits
  const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
  // Format as per ABHA standard: XX-XXXX-XXXX-XXXX
  return `${digits.substring(0,2)}-${digits.substring(2,6)}-${digits.substring(6,10)}-${digits.substring(10,14)}`;
};

/**
 * Generates ABHA address (health ID)
 * Format: firstname.lastname@abdm
 */
const generateAbhaAddress = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  const randomSuffix = Math.floor(Math.random() * 9999);
  return `${cleanName}${randomSuffix}@abdm`;
};

/**
 * Generate a simple SVG QR code placeholder (in real app, use qrcode library)
 */
const generateAbhaCard = (abhaId, name, dob) => {
  const color = '#1a73e8';
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f4c81;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a73e8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" rx="12" fill="url(#bg)"/>
      <text x="20" y="35" fill="white" font-size="22" font-weight="bold" font-family="Arial">🏥 ABHA</text>
      <text x="20" y="55" fill="#a0c4ff" font-size="11" font-family="Arial">Ayushman Bharat Health Account</text>
      <line x1="20" y1="65" x2="380" y2="65" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <text x="20" y="100" fill="#a0c4ff" font-size="11" font-family="Arial">Name</text>
      <text x="20" y="118" fill="white" font-size="16" font-weight="bold" font-family="Arial">${name}</text>
      <text x="20" y="148" fill="#a0c4ff" font-size="11" font-family="Arial">ABHA ID</text>
      <text x="20" y="166" fill="white" font-size="18" font-weight="bold" font-family="Arial" letter-spacing="2">${abhaId}</text>
      <text x="20" y="196" fill="#a0c4ff" font-size="10" font-family="Arial">Govt. of India | National Health Authority</text>
      <rect x="320" y="80" width="65" height="65" rx="4" fill="white" opacity="0.15"/>
      <text x="352" y="118" fill="white" font-size="28" text-anchor="middle" font-family="Arial">⬛</text>
    </svg>
  `).toString('base64')}`;
};

module.exports = { generateAbhaId, generateAbhaAddress, generateAbhaCard };
