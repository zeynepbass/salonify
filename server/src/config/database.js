import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDatabase(uri = env.mongodbUri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
