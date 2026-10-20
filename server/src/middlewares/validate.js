import { ApiError } from '../utils/ApiError.js';

// Doğrulama kuralları validators/ altındaki şemalarda durur; controller'lar
// yalnızca doğrulanmış veriyle çalışır. Şemalar tanımadıkları alanları
// attığı için, istekle birlikte gönderilen fazladan alanlar (ör. role,
// status, salon) modele hiç ulaşmaz (mass assignment koruması).
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

      // Express 5'te req.query salt okunur bir getter olduğu için atama
      // yerine property'yi yeniden tanımlıyoruz.
      Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true, enumerable: true });
    }
    next();
  };
}
