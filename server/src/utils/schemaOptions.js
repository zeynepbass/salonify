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
