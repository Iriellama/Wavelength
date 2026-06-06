export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function validationError(message: string, errors?: unknown): AppError {
  const err = new AppError(message, 400, 'VALIDATION_ERROR')
  if (errors !== undefined) {
    ;(err as AppError & { errors: unknown }).errors = errors
  }
  return err
}
