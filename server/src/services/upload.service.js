import { Readable } from 'node:stream';
import mongoose from 'mongoose';
import { UPLOAD_MIME_TYPES } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';

// Görseller MongoDB'de GridFS ile saklanır. GridFS büyük dosyaları parçalara
// bölerek iki koleksiyonda (uploads.files, uploads.chunks) tutar. Böylece
// ayrı bir depolama servisi ve ek bir secret gerekmez; sunucu yeniden
// başlasa ya da başka bir makineye taşınsa da dosyalar kaybolmaz (yerel
// diske yazılan dosyalar çoğu barındırma ortamında kalıcı değildir).
const getBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

// Dosyanın gerçek türü içeriğin ilk baytlarından ("magic bytes") anlaşılır.
// İstemcinin gönderdiği Content-Type ve dosya uzantısı kolayca
// değiştirilebildiği için onlara güvenmiyoruz; aksi halde görsel kılığında
// HTML ya da script yüklenip bizim alan adımızdan sunulabilirdi.
function detectImageType(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

export async function saveImage({ buffer, ownerId }) {
  const contentType = detectImageType(buffer);
  if (!contentType || !UPLOAD_MIME_TYPES.includes(contentType)) {
    throw new ApiError(400, 'Yalnızca JPG, PNG veya WebP görseller yüklenebilir.');
  }

  // Dosya adı istemciden alınmaz; kimlik veritabanı tarafından üretilir.
  const stream = getBucket().openUploadStream('image', { metadata: { owner: ownerId, contentType } });
  await new Promise((resolve, reject) => {
    Readable.from(buffer).pipe(stream).on('finish', resolve).on('error', reject);
  });

  return { id: String(stream.id), contentType, size: buffer.length };
}

export async function openImage(fileId) {
  const bucket = getBucket();
  const [file] = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
  if (!file) throw new ApiError(404, 'Görsel bulunamadı.');

  return { contentType: file.metadata.contentType, size: file.length, stream: bucket.openDownloadStream(file._id) };
}

export async function deleteUploadsOf(ownerId) {
  const bucket = getBucket();
  const files = await bucket.find({ 'metadata.owner': ownerId }).project({ _id: 1 }).toArray();
  await Promise.all(files.map((file) => bucket.delete(file._id)));
}
