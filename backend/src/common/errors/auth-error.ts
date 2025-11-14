import { AppError } from './app-error';

export class AuthError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED', details?: unknown) {
    super(401, code, message, details);
  }
}
