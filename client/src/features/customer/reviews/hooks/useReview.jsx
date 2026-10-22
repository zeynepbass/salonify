"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { appointmentKeys, salonKeys } from "@/lib/queryKeys";

export function useCreateReview(appointmentId, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, comment, photos = [], isPublic }) => {
      const uploads = await Promise.all(photos.map((photo) => api.uploadImage(photo.file)));
      return api.post(`/appointments/${appointmentId}/review`, {
        rating,
        comment: comment.trim(),
        hairPhotos: uploads.map((upload) => upload.url),
        isPublic,
      });
    },
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: salonKeys.all });
      options.onSuccess?.(...args);
    },
  });
}
