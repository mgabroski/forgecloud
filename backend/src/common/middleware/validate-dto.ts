import { RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationError as DomainValidationError } from '../errors/validation-error';

export function validateDto<T>(dtoClass: new () => T): RequestHandler {
  return async (req, _res, next) => {
    const instance = plainToInstance(dtoClass, req.body);

    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formatted = errors.map((e: ValidationError) => ({
        property: e.property,
        constraints: e.constraints,
      }));

      // Pass to global error handler
      return next(new DomainValidationError(formatted));
    }

    req.body = instance;
    next();
  };
}
