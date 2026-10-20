import multer from 'multer';
import { UPLOAD_MAX_BYTES } from '../constants/index.js';

// Dosya önce belleğe alınır, türü doğrulandıktan sonra veritabanına yazılır.
// Boyut ve adet sınırı burada uygulanır; sınırı aşan yükleme daha okunurken kesilir.
export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_BYTES, files: 1 },
}).single('file');
