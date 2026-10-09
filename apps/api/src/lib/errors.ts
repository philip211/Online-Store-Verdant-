export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export const notFound = (what = 'Не найдено') => new HttpError(404, what)
export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details)
