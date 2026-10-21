import { ApiError } from '../utils/ApiError.js';

export function validate(schemas) {
  return (req, _res, next) => {
    for (const part of ['params', 'query', 'body']) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part] ?? {});
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
        throw new ApiError(400, errors[0].message, errors);
      }

      Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true, enumerable: true });
    }
    next();
  };
}
