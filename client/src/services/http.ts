/** Error body shape from the API: `{ error: { code, message, fields } }`. */
interface ApiEnvelopeError {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

/** Error thrown by every failed API call; `status` 0 means the network failed. */
export class ApiError extends Error {
  readonly status: number;
  /** Stable machine code from the server (VALIDATION_ERROR, DUPLICATE_EMAIL, …). */
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, message: string, code = 'UNEXPECTED_ERROR', fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function baseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
}

/**
 * Fetch wrapper for the API's `{ data }` envelope. Returns the parsed body and
 * turns every non-2xx response into an ApiError carrying the server's
 * machine code plus message/fields. Callers unwrap `body.data` themselves.
 */
export async function httpClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check that the API is running.', 'NETWORK_ERROR');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code = 'UNEXPECTED_ERROR';
    let fields: Record<string, string> | undefined;
    try {
      const body = (await response.json()) as { error?: ApiEnvelopeError };
      if (body.error?.message) message = body.error.message;
      if (body.error?.code) code = body.error.code;
      if (body.error?.fields) fields = body.error.fields;
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(response.status, message, code, fields);
  }

  return (await response.json()) as T;
}
