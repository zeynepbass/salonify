import * as uploadService from '../services/upload.service.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';

export async function upload(req, res) {
  if (!req.file) throw new ApiError(400, 'Yüklenecek görseli "file" alanında gönderin.');

  const file = await uploadService.saveImage({ buffer: req.file.buffer, ownerId: req.user._id });
  // Dönen adres; değerlendirme fotoğrafı, portföy görseli veya salon kapak
  // görseli olarak ilgili uçlara gönderilir.
  const url = `${req.protocol}://${req.get('host')}/api/uploads/${file.id}`;
  sendSuccess(res, { ...file, url }, 201);
}

export async function download(req, res) {
  const file = await uploadService.openImage(req.params.fileId);

  res.set({
    'Content-Type': file.contentType,
    'Content-Length': file.size,
    // Dosyalar değişmez (her yükleme yeni bir kimlik alır); uzun süre önbelleğe alınabilir.
    'Cache-Control': 'public, max-age=31536000, immutable',
    // Helmet varsayılan olarak kaynakları yalnızca aynı origin'e açar.
    // Görseller farklı bir adresteki frontend'de <img> ile gösterileceği
    // için bu uçta izni genişletiyoruz.
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  file.stream.pipe(res);
}
