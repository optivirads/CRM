export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceCategory: 'mobile' | 'desktop';
  deviceModel?: string;
  os: string;
  browser: string;
  formatted: string;
  ip: string;
  userAgent: string;
  loggedInAt: string;
  lastActiveAt?: string;
}

/**
 * Parses user-agent header and client IP into detailed, structured device metadata
 * including exact phone models (iPhone, Samsung Galaxy, Pixel, OnePlus, Xiaomi, etc.),
 * precise mobile operating system versions, and specific mobile/desktop browsers.
 */
export function parseDeviceInfo(userAgent: string = '', rawIp: string = ''): DeviceInfo {
  const ua = userAgent || '';
  let ip = rawIp.replace(/^::ffff:/, '').trim() || '127.0.0.1';
  if (ip === '::1') ip = '127.0.0.1';

  // 1. Detect Device Type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/iPad|tablet|PlayBook|Silk|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|webOS|Fennec|Windows Phone/i.test(ua)) {
    deviceType = 'mobile';
  }

  // 2. Detect Specific Hardware / Device Model
  let deviceModel = '';
  if (/iPhone/i.test(ua)) {
    deviceModel = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    deviceModel = 'Apple iPad';
  } else if (/iPod/i.test(ua)) {
    deviceModel = 'Apple iPod';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceModel = 'Mac';
  } else if (/Windows/i.test(ua)) {
    deviceModel = 'Windows PC';
  } else if (/Android/i.test(ua)) {
    // Extract Android Hardware Model from UA: (Linux; Android 14; [MODEL] Build/...)
    const androidMatch = ua.match(/Android[^;]+;\s*([^;)]+)(?:;\s*|;|\)|Build)/i);
    let rawModel = androidMatch ? androidMatch[1].trim() : '';

    // Clean build identifiers or locale
    rawModel = rawModel.replace(/Build\/.*$/i, '').replace(/^[a-z]{2}-[a-z]{2}\s+/i, '').trim();

    if (/SM-[A-Z0-9]+/i.test(rawModel) || /SAMSUNG/i.test(ua)) {
      const smCode = rawModel.match(/SM-[A-Z0-9]+/i)?.[0] || rawModel;
      deviceModel = `Samsung Galaxy (${smCode})`;
    } else if (/Pixel\s*[0-9a-zA-Z\s]*/i.test(rawModel)) {
      const pixelName = rawModel.match(/Pixel\s*[0-9a-zA-Z\s]*/i)?.[0] || 'Google Pixel';
      deviceModel = `Google ${pixelName.trim()}`;
    } else if (/OnePlus|CPH[0-9]+/i.test(rawModel)) {
      deviceModel = `OnePlus (${rawModel})`;
    } else if (/Redmi|POCO|Xiaomi|220[0-9A-Z]+|210[0-9A-Z]+|M2[0-9A-Z]+/i.test(rawModel)) {
      deviceModel = `Xiaomi / Redmi (${rawModel})`;
    } else if (/vivo|V2[0-9A-Z]+/i.test(rawModel)) {
      deviceModel = `Vivo (${rawModel})`;
    } else if (/OPPO/i.test(rawModel)) {
      deviceModel = `Oppo (${rawModel})`;
    } else if (/Realme|RMX[0-9]+/i.test(rawModel)) {
      deviceModel = `Realme (${rawModel})`;
    } else if (/moto/i.test(rawModel) || /Motorola/i.test(rawModel)) {
      deviceModel = `Motorola (${rawModel})`;
    } else if (rawModel && rawModel !== 'Mobile' && rawModel !== 'K' && rawModel.length > 1) {
      deviceModel = rawModel;
    } else {
      deviceModel = 'Android Device';
    }
  } else if (/Linux/i.test(ua)) {
    deviceModel = 'Linux System';
  }

  // 3. Detect Operating System with Exact Version
  let os = 'Unknown OS';
  if (/Windows NT 10\.0/i.test(ua)) {
    os = 'Windows 11/10';
  } else if (/Windows NT 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/Windows NT 6\.2/i.test(ua)) {
    os = 'Windows 8';
  } else if (/Windows NT 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/iPhone OS ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/iPhone OS ([0-9_]+)/i);
    const ver = match ? match[1].replace(/_/g, '.') : '';
    os = ver ? `iOS ${ver}` : 'iOS';
  } else if (/iPad.*OS ([0-9_]+)/i.test(ua) || (deviceType === 'tablet' && /OS ([0-9_]+)/i.test(ua))) {
    const match = ua.match(/OS ([0-9_]+)/i);
    const ver = match ? match[1].replace(/_/g, '.') : '';
    os = ver ? `iPadOS ${ver}` : 'iPadOS';
  } else if (/Android\s*([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Android\s*([0-9.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_]+)/i);
    if (match) {
      const ver = match[1].replace(/_/g, '.');
      os = `macOS ${ver}`;
    } else {
      os = 'macOS';
    }
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // 4. Detect Browser & Client
  let browser = 'Unknown Browser';
  if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([0-9.]+)/i);
    browser = `Samsung Internet ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/EdgA\/([0-9.]+)|EdgiOS\/([0-9.]+)|Edg\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/(?:EdgA|EdgiOS|Edg)\/([0-9.]+)/i);
    browser = `Edge ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/OPR\/([0-9.]+)|Opera Mini\/([0-9.]+)|OPT\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/(?:OPR|Opera Mini|OPT)\/([0-9.]+)/i);
    browser = `Opera ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/CriOS\/([0-9.]+)/i.test(ua)) {
    // Chrome on iOS
    const match = ua.match(/CriOS\/([0-9.]+)/i);
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/FxiOS\/([0-9.]+)/i.test(ua)) {
    // Firefox on iOS
    const match = ua.match(/FxiOS\/([0-9.]+)/i);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/UCBrowser\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/UCBrowser\/([0-9.]+)/i);
    browser = `UC Browser ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Instagram/i.test(ua)) {
    browser = 'Instagram App';
  } else if (/FBAN|FBAV/i.test(ua)) {
    browser = 'Facebook App';
  } else if (/Chrome\/([0-9.]+)/i.test(ua) && !/Chromium/i.test(ua)) {
    const match = ua.match(/Chrome\/([0-9.]+)/i);
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua) || (/Safari/i.test(ua) && /Mobile/i.test(ua))) {
    const match = ua.match(/Version\/([0-9.]+)/i);
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Firefox\/([0-9.]+)/i);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/PostmanRuntime/i.test(ua)) {
    browser = 'Postman API Client';
  } else if (/Node|undici|node-fetch/i.test(ua)) {
    browser = 'Node.js Agent';
  }

  // 5. Build Formatted Label
  let formatted = '';
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    if (deviceModel && os !== 'Unknown OS') {
      formatted = `${deviceModel} • ${os} (${browser})`;
    } else if (os !== 'Unknown OS') {
      formatted = `${os} • ${browser}`;
    } else {
      formatted = `Mobile Device • ${browser}`;
    }
  } else {
    if (os !== 'Unknown OS') {
      formatted = `${os} • ${browser}`;
    } else {
      formatted = `${deviceModel || 'Desktop System'} • ${browser}`;
    }
  }

  const deviceCategory: 'mobile' | 'desktop' = (deviceType === 'mobile' || deviceType === 'tablet') ? 'mobile' : 'desktop';

  return {
    deviceType,
    deviceCategory,
    deviceModel: deviceModel || undefined,
    os,
    browser,
    formatted,
    ip,
    userAgent: ua,
    loggedInAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };
}

export function getDeviceCategory(device: DeviceInfo | { deviceType?: string } | string | null | undefined): 'mobile' | 'desktop' {
  if (!device) return 'desktop';
  if (typeof device === 'string') {
    return (device === 'mobile' || device === 'tablet') ? 'mobile' : 'desktop';
  }
  const dtype = (device as any).deviceType || (device as any).deviceCategory;
  return (dtype === 'mobile' || dtype === 'tablet') ? 'mobile' : 'desktop';
}
