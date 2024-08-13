import { Response } from 'supertest';

expect.extend({
  toBeOk(response: Response) {
    if (response.ok) {
      return {
        message: () => 'Ok',
        pass: true,
      };
    } else {
      const request = response.request || {}; // Добавьте защиту от отсутствия request

      return {
        message: () => [
          `> ${request.method || 'UNKNOWN'} ${request.url || 'UNKNOWN'} HTTP/1.1`,
          formatHeaders('> ', request.headers || {}), // Защита от отсутствия headers
          `< HTTP/1.1 ${response.status}`,
          formatHeaders('< ', response.headers || {}), // Защита от отсутствия headers
          response.text,
        ]
          .filter(Boolean)
          .join('\n'),
        pass: false,
      };
    }
  },
});

function formatHeaders(
  prefix: string,
  headers: Response['headers'] | Response['request']['headers'] | undefined | null,
) {
  if (!headers) return '';
  const entries =
    headers instanceof Headers
      ? Array.from(headers.entries())
      : Object.entries(headers);
  return entries.map(([key, value]) => `${prefix}${key}: ${value}`).join('\n');