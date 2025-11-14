import { AppError } from './app-error';

export class ValidationError extends AppError {
  constructor(details?: unknown) {
    super(400, 'VALIDATION_ERROR', 'Validation failed', details);
  }
}
