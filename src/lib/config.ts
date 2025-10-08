const urlCatcherUrl = import.meta.env.VITE_URL_CATCHER_URL;

if (!urlCatcherUrl) {
  console.warn('[config] VITE_URL_CATCHER_URL is not set. Falling back to http://localhost:3000.');
}

export const URL_CATCHER_URL = urlCatcherUrl ?? 'http://localhost:3000';
