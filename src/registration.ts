export interface RegistrationPayload {
  name: string;
  email: string;
  date?: string;
}

export async function submitRegistrationToGoogleSheets(
  url: string,
  payload: RegistrationPayload
): Promise<Response> {
  console.log('[Registro] Enviando a Google Sheets:', { url, payload });

  const params = new URLSearchParams();
  params.set('name', payload.name);
  params.set('email', payload.email);
  params.set('date', payload.date ?? '');
  params.set('payload', JSON.stringify(payload));

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: params.toString(),
  });
}
