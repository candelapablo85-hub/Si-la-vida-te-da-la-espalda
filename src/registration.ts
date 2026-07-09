export const DEFAULT_GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzH0wIiF1l_cwYIPqsVNkKmpOawhpVmyd088LZA6Hyw3pg_5908UYHkpNz1xmFb5l7N/exec';

export interface RegistrationPayload {
  name: string;
  email: string;
  date?: string;
}

export async function submitRegistrationToGoogleSheets(
  url: string,
  payload: RegistrationPayload
): Promise<Response> {
  const endpoint = url || DEFAULT_GOOGLE_SHEETS_URL;
  const normalizedPayload: RegistrationPayload = {
    ...payload,
    date: payload.date ?? new Date().toISOString(),
  };

  console.log('[Registro] Enviando a Google Sheets:', { url: endpoint, payload: normalizedPayload });

  const body = JSON.stringify(normalizedPayload);

  return fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body,
  });
}
