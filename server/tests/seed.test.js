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

  it('boş veritabanına bütün koleksiyonlar için tutarlı veri yazar', async () => {
    const result = await seed.seedDatabase();
    assert.equal(result.salons, 8);
    assert.ok(result.appointments >= 20 && result.reviews >= 10 && result.portfolio >= 15 && result.notifications >= 9);

    const salons = (await api().get('/api/salons').query({ search: 'ayşe yılmaz' })).body.data.items;
    assert.equal(salons.length, 1);
    assert.equal(salons[0].reviewCount, 5);
    assert.equal(salons[0].rating, 4.6);
    assert.equal(salons[0].startingPrice, 350);
    assert.equal(salons[0].categories.length, 7);
  });

  it('örnek hesaplarla giriş yapılır ve her ekranın verisi gelir', async () => {
    const login = async (email) =>
      (await api().post('/api/auth/login').send({ email, password: seed.SEED_PASSWORD })).body.data.accessToken;

    const customer = await login('elif.kaya@posta.com');
    const appointments = (await api().get('/api/appointments').set(auth(customer))).body.data.items;
    assert.deepEqual([...new Set(appointments.map((item) => item.status))].sort(), ['BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']);
    assert.equal((await api().get('/api/users/me/reviews').set(auth(customer))).body.data.items.length, 2);
    assert.equal((await api().get('/api/notifications').set(auth(customer))).body.data.unreadCount, 3);

    const salon = await login('ayse@ayseyilmazstudio.com');
    const panel = (await api().get('/api/salon/me/appointments').set(auth(salon))).body.data;
    assert.ok(panel.counts.upcoming >= 3 && panel.counts.past >= 7);
    assert.equal((await api().get('/api/salon/me/services').set(auth(salon))).body.data.length, 8);

    const portfolio = (await api().get('/api/salon/me/portfolio').set(auth(salon))).body.data;
    const salonId = portfolio[0].salon;
    const publicPortfolio = (await api().get(`/api/salons/${salonId}/portfolio`)).body.data;
    assert.equal(portfolio.filter((item) => !item.hasConsent).length, 1);
    assert.equal(portfolio.length, 7);
    assert.equal(publicPortfolio.length, 4);
    assert.equal((await api().get(`/api/salons/${salonId}/reviews`)).body.data.items.length, 4);
  });

  it('dolu veritabanının üzerine yazmaz; --reset ile baştan yazar', async () => {
    await assert.rejects(seed.seedDatabase(), /--reset/);
    const result = await seed.seedDatabase({ reset: true });
    assert.equal(result.salons, 8);
  });
});
