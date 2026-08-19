/**
 * Client for the app's own backend (server.ts).
 *
 * The AI features call Express routes that proxy Gemini, so the API key never
 * reaches the browser. Those routes only exist when the Node server is running
 * (`npm run dev`, or a Node host). On a static deployment such as GitHub Pages
 * the request lands on the 404 page instead, and `response.json()` then fails
 * with "Unexpected token '<'" — accurate, but meaningless to a user.
 *
 * postJson turns that into a clear explanation of what is actually missing.
 */

export class BackendUnavailableError extends Error {
  constructor() {
    super(
      'The AI service is not available in this deployment. These features call a ' +
        'backend that holds the Gemini API key, which is not part of the static ' +
        'build. Run the app locally with "npm run dev" to use them.'
    );
    this.name = 'BackendUnavailableError';
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Network-level failure: offline, DNS, connection refused.
    throw new BackendUnavailableError();
  }

  // A static host answers unknown paths with an HTML 404 rather than JSON.
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new BackendUnavailableError();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data && (data.error || data.message)) ||
        `Request failed with status ${response.status}.`
    );
  }

  return data as T;
}

/** True when the backend is reachable — used to disable AI controls up front. */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    const contentType = response.headers.get('content-type') || '';
    return response.ok && contentType.includes('application/json');
  } catch {
    return false;
  }
}
