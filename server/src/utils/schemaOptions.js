// Bütün modellerde ortak şema ayarları: createdAt/updatedAt alanları ve
// JSON çıktısında `_id` yerine `id`. `hidden` ile verilen alanlar (ör. şifre
// hash'i) API cevabına hiçbir zaman yazılmaz.
export function schemaOptions({ hidden = [] } = {}) {
  return {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        delete ret._id;
        for (const field of hidden) delete ret[field];
        return ret;
      },
    },
  };
}
