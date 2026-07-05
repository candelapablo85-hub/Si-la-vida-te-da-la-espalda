export const DEFAULT_PDF_DOWNLOAD_PATH = '/assets/Adelanto-libro.pdf';

export function getPdfDownloadUrl(configuredUrl?: string) {
  return configuredUrl || DEFAULT_PDF_DOWNLOAD_PATH;
}
