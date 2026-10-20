import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

// Testler gerçek Atlas veritabanına dokunmaz; her çalıştırmada bellekte
// geçici bir MongoDB ayağa kalkar. Environment değerleri, uygulama modülleri
// yüklenmeden önce ayarlanmalıdır; bu yüzden app dinamik import edilir.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.CLIENT_URL = 'http://localhost:3000';

let mongo;
let app;
let database;
let counter = 0;

export async function startApp() {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri('salonabox_test');

  database = await import('../src/config/database.js');
  app = (await import('../src/app.js')).default;
  await database.connectDatabase();
  return app;
}

export async function stopApp() {
  await database?.disconnectDatabase();
  await mongo?.stop();
}

export const api = () => request(app);
export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export async function registerCustomer(overrides = {}) {
  counter += 1;
  const response = await api()
    .post('/api/auth/register')
    .send({ name: `Müşteri ${counter}`, email: `musteri${counter}@test.com`, password: 'gizli-sifre-1', phone: '0532 000 00 00', ...overrides });
  return { ...response.body.data, token: response.body.data?.accessToken, response };
}

export async function registerSalon(overrides = {}) {
  counter += 1;
  const response = await api()
    .post('/api/auth/register')
    .send({
      name: `Salon Sahibi ${counter}`,
      email: `salon${counter}@test.com`,
      password: 'gizli-sifre-1',
      role: 'SALON',
      salon: { name: `Test Salon ${counter}`, city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Moda' },
      ...overrides,
    });
  return { ...response.body.data, token: response.body.data?.accessToken, response };
}

export async function createService(token, overrides = {}) {
  const response = await api()
    .post('/api/salon/me/services')
    .set(auth(token))
    .send({ name: 'Saç Kesimi', category: 'kesim', duration: 60, price: 600, ...overrides });
  return response.body.data;
}
