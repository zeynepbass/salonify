// Beklenen (operasyonel) hataları temsil eder: "salon bulunamadı", "yetkiniz
// yok" gibi. Global error middleware bu sınıfı tanır ve mesajı kullanıcıya
// güvenle gösterir. Bu sınıftan olmayan hatalar ise beklenmeyen hatalardır
// ve detayları dışarı sızdırılmaz.
export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// MongoDB unique index ihlali (E11000). `field` verilirse ihlalin o alanı
// içeren index'ten geldiğini de doğrular; böylece farklı unique index'leri
// birbirinden ayırabiliyoruz.
export function isDuplicateKeyError(error, field) {
  if (error?.code !== 11000) return false;
  return field ? Boolean(error.keyPattern && field in error.keyPattern) : true;
}
