import { z } from 'zod';
import { booleanQuery, objectId, paginationQuery } from './common.js';

export const listNotificationsSchema = {
  query: z.object({
    unreadOnly: booleanQuery.optional(),
    ...paginationQuery(),
  }),
};

export const notificationIdSchema = {
  params: z.object({ notificationId: objectId('Bildirim kimliği') }),
};
