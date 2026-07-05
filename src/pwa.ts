export function shouldRegisterServiceWorker(isDev: boolean) {
  return !isDev && typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export function registerServiceWorker(isDev = import.meta.env.DEV) {
  if (!shouldRegisterServiceWorker(isDev)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service Worker registration failed:', error);
    });
  });
}
