import { UPLOAD_MAX_BYTES } from '../constants/index.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `${req.method} ${req.originalUrl} bulunamadı.`));
}

function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (error.type === 'entity.parse.failed') return new ApiError(400, 'Gönderilen JSON geçersiz.');
  if (error.type === 'entity.too.large') return new ApiError(413, 'İstek gövdesi çok büyük.');
  if (error.name === 'MulterError') {
    return error.code === 'LIMIT_FILE_SIZE'
      ? new ApiError(413, `Görsel en fazla ${UPLOAD_MAX_BYTES / 1024 / 1024} MB olabilir.`)
      : new ApiError(400, 'Dosya yüklenemedi. Tek bir görseli "file" alanında gönderin.');
  }
  if (error.name === 'CastError') return new ApiError(400, 'Geçersiz kimlik.');
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors ?? {})[0]?.message ?? 'Gönderilen veri geçersiz.';
    return new ApiError(400, message);
  }
  if (isDuplicateKeyError(error)) return new ApiError(409, 'Bu kayıt zaten mevcut.');

  return null;
}

export function errorHandler(error, _req, res, _next) {
  const apiError = toApiError(error);

  if (!apiError) {
    return res.status(500).json({ success: false, message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.' });
  }

  const body = { success: false, message: apiError.message };
  if (apiError.errors) body.errors = apiError.errors;
  return res.status(apiError.statusCode).json(body);
}
