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

  const params = new URLSearchParams();
  params.set('name', normalizedPayload.name);
  params.set('email', normalizedPayload.email);
  params.set('date', normalizedPayload.date ?? '');
  params.set('payload', JSON.stringify(normalizedPayload));

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: params.toString(),
  });
}
