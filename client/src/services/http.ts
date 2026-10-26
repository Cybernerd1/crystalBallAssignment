interface ApiEnvelopeError {
  message?: string;
  fields?: Record<string, string>;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: ApiEnvelopeError;
}

/** Error thrown by every failed API call; `status` 0 means the network failed. */
export class ApiError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

function baseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
}

/**
 * Fetch wrapper for the API's `{ success, data, error }` envelope. Returns the
 * full envelope and turns every non-2xx response into an ApiError carrying the
 * server's message/fields. Callers unwrap `envelope.data` themselves.
 */
export async function httpClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check that the API is running.');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let fields: Record<string, string> | undefined;
    try {
      const body = (await response.json()) as ApiEnvelope<unknown>;
      if (body.error?.message) message = body.error.message;
      if (body.error?.fields) fields = body.error.fields;
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(response.status, message, fields);
  }

  return (await response.json()) as T;
}
