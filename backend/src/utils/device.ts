export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  formatted: string;
  ip: string;
  userAgent: string;
  loggedInAt: string;
  lastActiveAt?: string;
}

/**
 * Parses user-agent header and client IP into structured device metadata.
 */
export function parseDeviceInfo(userAgent: string = '', rawIp: string = ''): DeviceInfo {
  const ua = userAgent || '';
  let ip = rawIp.replace(/^::ffff:/, '').trim() || '127.0.0.1';
  if (ip === '::1') ip = '127.0.0.1';

  // 1. Detect Device Type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/iPad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated/i.test(ua)) {
    deviceType = 'mobile';
  }

  // 2. Detect Operating System
  let os = 'Unknown OS';
  if (/Windows NT 10\.0/i.test(ua)) {
    // Windows 10 or 11
    os = 'Windows 11/10';
  } else if (/Windows NT 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/Windows NT 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    if (match) {
      const ver = match[1].replace(/_/g, '.');
      os = `macOS ${ver}`;
    } else {
      os = 'macOS';
    }
  } else if (/iPhone OS ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/iPhone OS ([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/iPad.*OS ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/OS ([0-9_]+)/);
    os = match ? `iPadOS ${match[1].replace(/_/g, '.')}` : 'iPadOS';
  } else if (/Android ([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Android ([0-9.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // 3. Detect Browser & Version
  let browser = 'Unknown Browser';
  if (/Edg\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Edg\/([0-9.]+)/);
    browser = `Edge ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/OPR\/([0-9.]+)/i.test(ua) || /Opera\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/(?:OPR|Opera)\/([0-9.]+)/);
    browser = `Opera ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Chrome\/([0-9.]+)/i.test(ua) && !/Chromium/i.test(ua)) {
    const match = ua.match(/Chrome\/([0-9.]+)/);
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua)) {
    const match = ua.match(/Version\/([0-9.]+)/);
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Firefox\/([0-9.]+)/);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/MSIE|Trident/i.test(ua)) {
    browser = 'Internet Explorer';
  } else if (ua.includes('PostmanRuntime')) {
    browser = 'Postman API Client';
  }

  const formatted = `${os} • ${browser}`;

  return {
    deviceType,
    os,
    browser,
    formatted,
    ip,
    userAgent: ua,
    loggedInAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };
}
