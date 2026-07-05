export interface RegistrationPayload {
  name: string;
  email: string;
  date?: string;
}

export async function submitRegistrationToGoogleSheets(
  url: string,
  payload: RegistrationPayload
): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
