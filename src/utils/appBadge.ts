/**
 * App Icon Badging Utility (Desktop taskbar/dock and Mobile home screen icon)
 * Updates the unread number badge directly on the app icon and browser tab
 */

export function updateAppBadge(unreadCount: number): void {
  if (typeof window === 'undefined') return;

  const count = Math.max(0, unreadCount);

  // 1. Native Badging API (Windows Taskbar, Mac Dock, Android/iOS PWA Home Screen icon)
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      navigator.setAppBadge(count).catch((e) => {
        console.debug('setAppBadge skipped:', e);
      });
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }

  // 2. Relay to Service Worker for background sync
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: count > 0 ? 'SET_BADGE' : 'CLEAR_BADGE',
        count,
      });
    } catch (e) {
      // ignore
    }
  }

  // 3. Tab Title Unread Counter: "(3) MAKS" or "MAKS"
  try {
    const baseTitle = 'MAKS';
    if (count > 0) {
      document.title = `(${count}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  } catch (e) {
    // ignore
  }

  // 4. Dynamic Favicon Badge for desktop browser tabs
  try {
    updateFaviconWithBadge(count);
  } catch (e) {
    // ignore
  }
}

export function clearAppBadge(): void {
  updateAppBadge(0);
}

/**
 * Draw a crisp notification count dot directly onto the favicon for desktop tabs
 */
function updateFaviconWithBadge(count: number): void {
  const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!favicon) return;

  if (count <= 0) {
    favicon.href = '/pwa-192x192.png';
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/pwa-192x192.png';
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 64, 64);

    // Draw red notification bubble
    const badgeText = count > 99 ? '99+' : String(count);
    const radius = 16;
    const cx = 64 - radius;
    const cy = radius;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#E53E3E'; // Vibrant Red
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0C0E15'; // Dark border
    ctx.stroke();

    // Draw white badge number text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Chivo", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, cx, cy + 1);

    favicon.href = canvas.toDataURL('image/png');
  };
}
