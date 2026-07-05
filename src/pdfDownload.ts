export const DEFAULT_PDF_DOWNLOAD_PATH = '/assets/Adelanto-libro.pdf';

export function getPdfDownloadUrl(configuredUrl?: string) {
  if (!configuredUrl) {
    return DEFAULT_PDF_DOWNLOAD_PATH;
  }

  if (/^https?:\/\//i.test(configuredUrl) || configuredUrl.startsWith('/')) {
    return configuredUrl;
  }

  return `/${configuredUrl.replace(/^\/+/, '')}`;
}
