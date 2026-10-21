import * as notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  sendSuccess(res, await notificationService.listNotifications({ userId: req.user._id, ...req.query }));
}

export async function markRead(req, res) {
  sendSuccess(
    res,
    await notificationService.markAsRead({ userId: req.user._id, notificationId: req.params.notificationId }),
  );
}

export async function markAllRead(req, res) {
  sendSuccess(res, await notificationService.markAllAsRead(req.user._id));
}

export async function remove(req, res) {
  sendSuccess(
    res,
    await notificationService.deleteNotification({ userId: req.user._id, notificationId: req.params.notificationId }),
  );
}

export async function removeAll(req, res) {
  sendSuccess(res, await notificationService.deleteAllNotifications(req.user._id));
}
