// Bütün başarılı cevaplar aynı zarfı kullanır: { success: true, data }.
export function sendSuccess(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function buildPagination({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
