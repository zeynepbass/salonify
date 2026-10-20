import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/response.js';

// Bildirim asıl işlemin bir yan etkisidir. Randevu başarıyla oluşmuşken
// bildirim yazılamadı diye müşteriye hata döndürmek yanlış olur; müşteri
// tekrar dener ve "bu saat dolu" cevabını alır. Bu yüzden bildirim hatası
// loglanır ama asıl işlemi bozmaz.
export async function notify(entries) {
  const valid = entries.filter((entry) => entry.recipient);
  if (valid.length === 0) return;

  try {
    await Notification.insertMany(valid);
  } catch (error) {
    console.error('Bildirim oluşturulamadı:', error.message);
  }
}

export async function listNotifications({ userId, page, limit, unreadOnly }) {
  // recipient filtresi her zaman token'daki kullanıcıdan gelir; kullanıcı
  // yalnızca kendisine yazılmış bildirimleri görebilir.
  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return { items, unreadCount, pagination: buildPagination({ page, limit, total }) };
}

export async function markAsRead({ userId, notificationId }) {
  // Sorguya recipient'ı da ekliyoruz: bildirim başkasına aitse "bulunamadı"
  // döner. Böylece hem yetkisiz güncelleme engellenir hem de başka
  // kullanıcıların bildirim kimliklerinin var olup olmadığı sızdırılmaz.
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { returnDocument: 'after' },
  );
  if (!notification) throw new ApiError(404, 'Bildirim bulunamadı.');
  return notification;
}

export async function markAllAsRead(userId) {
  const result = await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  return { updatedCount: result.modifiedCount };
}
