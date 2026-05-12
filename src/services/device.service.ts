/**
 * Device Fingerprinting Service
 * 
 * Generates a deterministic browser fingerprint from hardware signals.
 * The fingerprint is COMPUTED every time — not stored. localStorage is only
 * a performance cache. Clearing cookies/storage has ZERO effect on the ID.
 */

// ── Fingerprint Generation ──────────────────────────────────────

async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    // Draw text with specific font rendering (GPU-dependent)
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Xtrinox.fp" 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Xtrinox.fp" 🔒', 4, 17);

    // Draw shapes (anti-aliasing is GPU-specific)
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return 'no-webgl';

    const renderer = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER) || 'unknown';
    const vendor = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).VENDOR) || 'unknown';
    return `${vendor}~${renderer}`;
  } catch {
    return 'webgl-error';
  }
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes a deterministic device fingerprint from hardware signals.
 * This is recomputed every time — clearing cookies has NO effect.
 */
export async function computeFingerprint(): Promise<string> {
  const signals = [
    await getCanvasFingerprint(),
    getWebGLRenderer(),
    String(navigator.hardwareConcurrency || 0),
    String((navigator as any).deviceMemory || 0),
    navigator.platform || 'unknown',
    navigator.language || 'unknown',
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
  ];

  const raw = signals.join('|:|');
  return sha256(raw);
}

// ── Browser / OS Detection ──────────────────────────────────────

export function parseBrowserInfo(): { browser: string; os: string } {
  const ua = navigator.userAgent;

  // Browser detection
  let browser = 'Unknown Browser';
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = `Edge ${match?.[1]?.split('.')[0] || ''}`.trim();
  } else if (ua.includes('OPR/') || ua.includes('Opera')) {
    const match = ua.match(/OPR\/([\d.]+)/);
    browser = `Opera ${match?.[1]?.split('.')[0] || ''}`.trim();
  } else if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = `Chrome ${match?.[1]?.split('.')[0] || ''}`.trim();
  } else if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = `Firefox ${match?.[1]?.split('.')[0] || ''}`.trim();
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = `Safari ${match?.[1]?.split('.')[0] || ''}`.trim();
  }

  // OS detection
  let os = 'Unknown OS';
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    os = `macOS ${match?.[1]?.replace(/_/g, '.') || ''}`.trim();
  } else if (ua.includes('Android')) {
    const match = ua.match(/Android ([\d.]+)/);
    os = `Android ${match?.[1] || ''}`.trim();
  } else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('CrOS')) os = 'Chrome OS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
}

// ── IP & Location ───────────────────────────────────────────────

export interface DeviceLocationInfo {
  ip: string;
  location: string; // "City, CountryCode"
}

export async function fetchLocationInfo(): Promise<DeviceLocationInfo> {
  try {
    // Step 1: Get public IP
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    const ip = ipData.ip || 'unknown';

    // Step 2: Get location from IP
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoRes.json();
      const city = geoData.city || 'Unknown';
      const country = geoData.country_code || geoData.country || '';
      return { ip, location: `${city}, ${country}` };
    } catch {
      return { ip, location: 'Unknown' };
    }
  } catch {
    return { ip: 'unknown', location: 'Unknown' };
  }
}

// ── Combined Device Info ────────────────────────────────────────

export interface FullDeviceInfo {
  deviceId: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
}

export async function getFullDeviceInfo(): Promise<FullDeviceInfo> {
  const [deviceId, locationInfo] = await Promise.all([
    computeFingerprint(),
    fetchLocationInfo(),
  ]);
  const { browser, os } = parseBrowserInfo();

  return {
    deviceId,
    browser,
    os,
    ip: locationInfo.ip,
    location: locationInfo.location,
  };
}
