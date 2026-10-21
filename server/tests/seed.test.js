import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { api, auth, startApp, stopApp } from './helpers.js';

before(startApp);
after(stopApp);

describe('örnek veri', () => {
  let seed;

  before(async () => {
    seed = await import('../scripts/seed.js');
  });

  it('boş veritabanına birbirine bağlı küçük bir veri seti yazar', async () => {
    const result = await seed.seedDatabase();
    assert.equal(result.salons, 1);
    assert.equal(result.services, 3);
    assert.equal(result.appointments, 5);
    assert.equal(result.reviews, 1);
    assert.equal(result.portfolio, 2);
    assert.equal(result.notifications, 6);

    const salons = (await api().get('/api/salons').query({ search: 'ayşe yılmaz' })).body.data.items;
    assert.equal(salons.length, 1);
    assert.equal(salons[0].reviewCount, 1);
    assert.equal(salons[0].rating, 5);
    assert.equal(salons[0].startingPrice, 350);
    assert.deepEqual([...salons[0].categories].sort(), ['boya', 'fon', 'kesim']);
  });

  it('örnek hesaplarla giriş yapılır ve aynı randevular iki tarafta da görünür', async () => {
    const login = async (email) =>
      (await api().post('/api/auth/login').send({ email, password: seed.SEED_PASSWORD })).body.data.accessToken;

    const customer = await login(seed.SEED_ACCOUNTS.customer);
    const appointments = (await api().get('/api/appointments').set(auth(customer))).body.data.items;
    assert.equal(appointments.length, 5);
    assert.deepEqual([...new Set(appointments.map((item) => item.status))].sort(), ['BOOKED', 'CANCELLED', 'COMPLETED']);
    assert.equal((await api().get('/api/users/me/reviews').set(auth(customer))).body.data.items.length, 1);
    assert.equal((await api().get('/api/notifications').set(auth(customer))).body.data.unreadCount, 2);

    const salon = await login(seed.SEED_ACCOUNTS.salon);
    const panel = (await api().get('/api/salon/me/appointments').set(auth(salon))).body.data;
    assert.equal(panel.counts.all, 5);
    assert.deepEqual(
      panel.items.map((item) => item.id).sort(),
      appointments.map((item) => item.id).sort(),
    );
    assert.equal((await api().get('/api/salon/me/services').set(auth(salon))).body.data.length, 3);

    const portfolio = (await api().get('/api/salon/me/portfolio').set(auth(salon))).body.data;
    const salonId = portfolio[0].salon;
    assert.equal((await api().get(`/api/salons/${salonId}/portfolio`)).body.data.length, 2);
    assert.equal((await api().get(`/api/salons/${salonId}/reviews`)).body.data.items.length, 1);
  });

  it('dolu veritabanının üzerine yazmaz; --reset ile baştan yazar', async () => {
    await assert.rejects(seed.seedDatabase(), /--reset/);
    const result = await seed.seedDatabase({ reset: true });
    assert.equal(result.appointments, 5);
  });
});
