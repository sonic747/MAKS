import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isKakaoOrInApp, setIsKakaoOrInApp] = useState(false);

  useEffect(() => {
    // 1. Detect standalone mode (actually running as standalone installed window)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // 2. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
    setIsMobile(isMobileDevice);

    // 3. Detect In-App browser (KakaoTalk, Naver, Line, Instagram, Facebook)
    const inApp = /kakaotalk|naver|line|instagram|fb_iab|fban|fbav/i.test(userAgent);
    setIsKakaoOrInApp(inApp);

    // 4. Listen to browser native beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('maks_pwa_installed', 'true');
        localStorage.setItem('maks_pwa_prompt_dismissed', 'true');
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('maks_pwa_installed', 'true');
        localStorage.setItem('maks_pwa_prompt_dismissed', 'true');
      } catch (err) {
        // ignore
      }
      return true;
    }
    return false;
  };

  return {
    deferredPrompt,
    isInstalled,
    isIOS,
    isMobile,
    isKakaoOrInApp,
    triggerInstall,
    canInstall: !isInstalled && (!!deferredPrompt || isIOS || isMobile || isKakaoOrInApp),
  };
}
