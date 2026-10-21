import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { addDays, getDayOfWeek, getSalonNow } from '../src/utils/time.js';
import { api, auth, createService, registerCustomer, registerSalon, startApp, stopApp } from './helpers.js';

function openDay(offset = 2) {
  let date = addDays(getSalonNow().date, offset);
  while (getDayOfWeek(date) === 0) date = addDays(date, 1);
  return date;
}

function sunday() {
  let date = addDays(getSalonNow().date, 1);
  while (getDayOfWeek(date) !== 0) date = addDays(date, 1);
  return date;
}

const book = (token, body) => api().post('/api/appointments').set(auth(token)).send(body);

before(startApp);
after(stopApp);

describe('auth', () => {
  it('kayıt olur, şifreyi ve token kayıtlarını cevapta döndürmez', async () => {
    const { response } = await registerCustomer();
    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.role, 'CUSTOMER');
    assert.ok(response.body.data.accessToken);
    assert.equal(response.body.data.user.passwordHash, undefined);
    assert.equal(response.body.data.user.refreshTokens, undefined);
    assert.match(response.headers['set-cookie'][0], /refreshToken=.*HttpOnly/);
  });

  it('tanımlı olmayan bir rolle kaydı reddeder', async () => {
    const { response } = await registerCustomer({ role: 'ADMIN' });
    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

  it('aynı e-posta ile ikinci kaydı ve geçersiz girdileri reddeder', async () => {
    await registerCustomer({ email: 'ayni@test.com' });
    assert.equal((await registerCustomer({ email: 'AYNI@test.com' })).response.status, 409);
    assert.equal((await registerCustomer({ email: 'gecersiz' })).response.status, 400);
    assert.equal((await registerCustomer({ password: 'kisa' })).response.status, 400);
  });

  it('yanlış şifre ve olmayan kullanıcı için aynı cevabı verir', async () => {
    await registerCustomer({ email: 'giris@test.com' });
    const wrongPassword = await api().post('/api/auth/login').send({ email: 'giris@test.com', password: 'yanlis-sifre' });
    const unknownUser = await api().post('/api/auth/login').send({ email: 'yok@test.com', password: 'yanlis-sifre' });
    assert.equal(wrongPassword.status, 401);
    assert.deepEqual(wrongPassword.body, unknownUser.body);
  });

  it('giriş yapar ve /me ile profili döner; token olmadan 401 verir', async () => {
    await registerCustomer({ email: 'ben@test.com' });
    const login = await api().post('/api/auth/login').send({ email: 'ben@test.com', password: 'gizli-sifre-1' });
    assert.equal(login.status, 200);

    const me = await api().get('/api/auth/me').set(auth(login.body.data.accessToken));
    assert.equal(me.body.data.user.email, 'ben@test.com');

    assert.equal((await api().get('/api/auth/me')).status, 401);
    assert.equal((await api().get('/api/auth/me').set(auth('sahte.token.degeri'))).status, 401);
  });

  it('refresh token rotasyonu yapar ve kullanılmış token tekrar denenirse oturumları kapatır', async () => {
    const { response } = await registerCustomer();
    const firstCookie = response.headers['set-cookie'][0].split(';')[0];

    const refreshed = await api().post('/api/auth/refresh').set('Cookie', firstCookie);
    assert.equal(refreshed.status, 200);
    assert.ok(refreshed.body.data.accessToken);
    const secondCookie = refreshed.headers['set-cookie'][0].split(';')[0];
    assert.notEqual(secondCookie, firstCookie);

    assert.equal((await api().post('/api/auth/refresh').set('Cookie', firstCookie)).status, 401);
    assert.equal((await api().post('/api/auth/refresh').set('Cookie', secondCookie)).status, 401);
  });

  it('çıkış yapınca refresh token geçersiz olur', async () => {
    const { response } = await registerCustomer();
    const cookie = response.headers['set-cookie'][0].split(';')[0];
    assert.equal((await api().post('/api/auth/logout').set('Cookie', cookie)).status, 200);
    assert.equal((await api().post('/api/auth/refresh').set('Cookie', cookie)).status, 401);
  });
});

describe('authorization ve ownership', () => {
  let customer, salonA, salonB, serviceA;

  before(async () => {
    customer = await registerCustomer();
    salonA = await registerSalon();
    salonB = await registerSalon();
    serviceA = await createService(salonA.token);
  });

  it('müşteri salon paneline, salon müşteri uçlarına erişemez', async () => {
    assert.equal((await api().get('/api/salon/me/dashboard').set(auth(customer.token))).status, 403);
    assert.equal((await api().post('/api/salon/me/services').set(auth(customer.token)).send({})).status, 403);
    assert.equal((await api().get('/api/appointments').set(auth(salonA.token))).status, 403);
    assert.equal((await api().get('/api/salon/me/dashboard')).status, 401);
  });

  it('salon başka bir salonun hizmetini değiştiremez veya silemez', async () => {
    const patch = await api().patch(`/api/salon/me/services/${serviceA.id}`).set(auth(salonB.token)).send({ price: 1 });
    const remove = await api().delete(`/api/salon/me/services/${serviceA.id}`).set(auth(salonB.token));
    assert.equal(patch.status, 404);
    assert.equal(remove.status, 404);

    const services = await api().get(`/api/salons/${salonA.salon.id}/services`);
    assert.equal(services.body.data[0].price, 600);
  });

  it('profil güncellemesiyle rol değiştirilemez', async () => {
    const response = await api().patch('/api/users/me').set(auth(customer.token)).send({ name: 'Yeni Ad', role: 'SALON' });
    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.name, 'Yeni Ad');
    assert.equal(response.body.data.user.role, 'CUSTOMER');
  });

  it('geçersiz ObjectId için 400, olmayan salon için 404 döner', async () => {
    assert.equal((await api().get('/api/salons/abc')).status, 400);
    const missing = await api().get('/api/salons/64b000000000000000000000');
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, { success: false, message: 'Salon bulunamadı.' });
  });
});

describe('salon listesi ve detayı', () => {
  let salon;

  before(async () => {
    salon = await registerSalon({ salon: { name: 'Işıltı Kuaför', city: 'İzmir', district: 'Konak' } });
    await createService(salon.token, { name: 'Balayage', category: 'balayage', duration: 180, price: 2500 });
    await createService(salon.token, { name: 'Fön', category: 'fon', duration: 30, price: 350 });
  });

  it('şehir, kategori ve arama ile filtreler', async () => {
    const byCity = await api().get('/api/salons').query({ city: 'İzmir' });
    assert.equal(byCity.body.data.items.length, 1);
    assert.equal(byCity.body.data.items[0].startingPrice, 350);
    assert.deepEqual(byCity.body.data.items[0].categories.sort(), ['balayage', 'fon']);
    assert.equal(byCity.body.data.pagination.total, 1);

    assert.equal((await api().get('/api/salons').query({ category: 'balayage' })).body.data.items.length, 1);
    assert.equal((await api().get('/api/salons').query({ city: 'İzmir', category: 'gelin' })).body.data.items.length, 0);
    assert.equal((await api().get('/api/salons').query({ search: 'IŞILTI' })).body.data.items.length, 1);
    assert.equal((await api().get('/api/salons').query({ search: 'balayage', city: 'İzmir' })).body.data.items.length, 1);
    assert.equal((await api().get('/api/salons').query({ search: '.*', city: 'İzmir' })).body.data.items.length, 0);
    assert.equal((await api().get('/api/salons').query({ rating: 4, city: 'İzmir' })).body.data.items.length, 0);
    assert.equal((await api().get('/api/salons').query({ limit: 500 })).status, 400);
  });

  it('detayda hizmetleri, portföyü ve çalışma saatlerini döner', async () => {
    const detail = await api().get(`/api/salons/${salon.salon.id}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.name, 'Işıltı Kuaför');
    assert.equal(detail.body.data.services.length, 2);
    assert.equal(detail.body.data.workingHours.length, 7);
    assert.equal(detail.body.data.workingHours[0].dayOfWeek, 1);
    assert.deepEqual(detail.body.data.portfolio, []);
    assert.equal(detail.body.data.rating, 0);
    assert.equal(detail.body.data.reviewCount, 0);
    assert.equal(detail.body.data.searchText, undefined);
  });
});

describe('müsaitlik', () => {
  let salon, service, customer;
  const date = openDay(3);
  const slotsOf = async (query) =>
    (await api().get(`/api/salons/${salon.salon.id}/availability`).query({ serviceId: service.id, date, ...query })).body.data;

  before(async () => {
    salon = await registerSalon();
    customer = await registerCustomer();
    service = await createService(salon.token, { duration: 60 });
  });

  it('çalışma saatleri ve molaya göre slot üretir', async () => {
    const data = await slotsOf();
    const available = data.slots.filter((slot) => slot.available).map((slot) => slot.time);

    assert.equal(data.isClosed, false);
    assert.equal(available[0], '09:00');
    assert.ok(available.includes('11:00'));
    assert.ok(!available.includes('11:30'), '11:30-12:30 molaya taşar');
    assert.ok(!available.includes('12:00'));
    assert.ok(available.includes('13:00'));
    assert.equal(available.at(-1), '18:00', 'hizmet kapanıştan önce bitmeli');
  });

  it('BOOKED randevunun kapladığı slotları çıkarır, iptal edilince geri verir', async () => {
    const booked = await book(customer.token, { salonId: salon.salon.id, serviceId: service.id, date, startTime: '10:00' });
    assert.equal(booked.status, 201);

    let slots = (await slotsOf()).slots;
    const isFree = (time) => slots.find((slot) => slot.time === time).available;
    assert.equal(isFree('09:00'), true);
    assert.equal(isFree('09:30'), false, '09:30-10:30 mevcut randevuyla çakışır');
    assert.equal(isFree('10:00'), false);
    assert.equal(isFree('10:30'), false);
    assert.equal(isFree('11:00'), true);

    slots = (await slotsOf({ excludeAppointmentId: booked.body.data.id })).slots;
    assert.equal(isFree('10:00'), true);

    await api().delete(`/api/appointments/${booked.body.data.id}`).set(auth(customer.token));
    slots = (await slotsOf()).slots;
    assert.equal(isFree('10:00'), true);
  });

  it('kapalı günde ve bloklanan tarihte slot döndürmez', async () => {
    const closed = await slotsOf({ date: sunday() });
    assert.equal(closed.isClosed, true);
    assert.deepEqual(closed.slots, []);

    const blockedDay = openDay(10);
    const block = await api().post('/api/salon/me/blocked-dates').set(auth(salon.token)).send({ date: blockedDay, note: 'Tatil' });
    assert.equal(block.status, 201);
    assert.equal((await slotsOf({ date: blockedDay })).isClosed, true);
    assert.equal((await api().post('/api/salon/me/blocked-dates').set(auth(salon.token)).send({ date: blockedDay })).status, 409);

    const reject = await book(customer.token, { salonId: salon.salon.id, serviceId: service.id, date: blockedDay, startTime: '10:00' });
    assert.equal(reject.status, 400);

    await api().delete(`/api/salon/me/blocked-dates/${block.body.data.id}`).set(auth(salon.token));
    assert.equal((await slotsOf({ date: blockedDay })).isClosed, false);
  });

  it('çalışma saatleri güncellenince müsaitlik değişir; tutarsız saatleri reddeder', async () => {
    const dayOfWeek = getDayOfWeek(date);
    const update = await api()
      .patch('/api/salon/me/working-hours')
      .set(auth(salon.token))
      .send({ days: [{ dayOfWeek, openTime: '14:00', closeTime: '16:00', breaks: [] }] });
    assert.equal(update.status, 200);
    assert.deepEqual((await slotsOf()).slots.map((slot) => slot.time), ['14:00', '14:30', '15:00']);

    const invalid = await api()
      .patch('/api/salon/me/working-hours')
      .set(auth(salon.token))
      .send({ days: [{ dayOfWeek, openTime: '18:00', closeTime: '09:00' }] });
    assert.equal(invalid.status, 400);

    const publicHours = await api().get(`/api/salons/${salon.salon.id}/working-hours`);
    assert.equal(publicHours.body.data.find((day) => day.dayOfWeek === dayOfWeek).openTime, '14:00');
  });

  it('geçersiz parametreleri reddeder', async () => {
    const url = `/api/salons/${salon.salon.id}/availability`;
    assert.equal((await api().get(url).query({ date })).status, 400);
    assert.equal((await api().get(url).query({ serviceId: service.id, date: '2026-13-45' })).status, 400);
    assert.equal((await api().get(url).query({ serviceId: salon.salon.id, date })).status, 404);
  });
});

describe('randevu', () => {
  let salon, otherSalon, service, otherService, customer, stranger;
  const date = openDay(4);
  const body = (overrides = {}) => ({ salonId: salon.salon.id, serviceId: service.id, date, startTime: '09:00', ...overrides });

  before(async () => {
    salon = await registerSalon();
    otherSalon = await registerSalon();
    customer = await registerCustomer();
    stranger = await registerCustomer();
    service = await createService(salon.token, { duration: 60 });
    otherService = await createService(otherSalon.token);
  });

  it('onay beklemeden doğrudan BOOKED oluşturur', async () => {
    const response = await book(customer.token, body({ notes: 'İlk ziyaret', status: 'COMPLETED', price: 1 }));
    assert.equal(response.status, 201);
    const appointment = response.body.data;
    assert.equal(appointment.status, 'BOOKED');
    assert.equal(appointment.endTime, '10:00');
    assert.equal(appointment.price, 600);
    assert.equal(appointment.customer, customer.user.id);
    assert.equal(appointment.salon.name, salon.salon.name);
    assert.match(appointment.reference, /^SL-\d{8}$/);
    assert.equal(appointment.slots, undefined);
  });

  it('dolu saate ve çakışan saate 409 döner', async () => {
    const same = await book(stranger.token, body());
    assert.equal(same.status, 409);
    assert.deepEqual(same.body, { success: false, message: 'Bu saat az önce başka bir müşteri tarafından alındı.' });
    assert.equal((await book(stranger.token, body({ startTime: '09:30' }))).status, 409);
  });

  it('aynı slota eş zamanlı gelen isteklerden yalnızca biri başarılı olur', async () => {
    const customers = await Promise.all(Array.from({ length: 8 }, () => registerCustomer()));
    const responses = await Promise.all(customers.map((item) => book(item.token, body({ startTime: '14:00' }))));
    const statuses = responses.map((response) => response.status).sort();

    assert.deepEqual(statuses, [201, 409, 409, 409, 409, 409, 409, 409]);
    const rejected = responses.find((response) => response.status === 409);
    assert.equal(rejected.body.message, 'Bu saat az önce başka bir müşteri tarafından alındı.');
  });

  it('uygulama kontrolü atlansa bile veritabanı çakışan kaydı reddeder', async () => {
    const { Appointment } = await import('../src/models/Appointment.js');
    const overlapping = {
      reference: 'SL-DBTEST01',
      customerName: 'Doğrudan Kayıt',
      salon: salon.salon.id,
      service: service.id,
      serviceName: service.name,
      duration: 60,
      price: 600,
      date,
      startTime: '14:30',
      endTime: '15:30',
    };

    await assert.rejects(Appointment.create(overlapping), (error) => error.code === 11000 && 'slots' in error.keyPattern);
    const cancelled = await Appointment.create({ ...overlapping, status: 'CANCELLED' });
    await cancelled.deleteOne();
  });

  it('kuralları ihlal eden istekleri reddeder', async () => {
    assert.equal((await book(customer.token, body({ startTime: '12:00' }))).status, 400, 'mola');
    assert.equal((await book(customer.token, body({ startTime: '18:30' }))).status, 400, 'kapanışı aşar');
    assert.equal((await book(customer.token, body({ startTime: '15:10' }))).status, 400, 'dilime uymuyor');
    assert.equal((await book(customer.token, body({ startTime: '25:00' }))).status, 400, 'saat biçimi');
    assert.equal((await book(customer.token, body({ date: addDays(getSalonNow().date, -1), startTime: '15:00' }))).status, 400, 'geçmiş');
    assert.equal((await book(customer.token, body({ date: sunday(), startTime: '15:00' }))).status, 400, 'kapalı gün');
    assert.equal((await book(customer.token, body({ serviceId: otherService.id, startTime: '15:00' }))).status, 404, 'başka salonun hizmeti');
    assert.equal((await api().post('/api/appointments').send(body())).status, 401);
  });

  it('müşteri yalnızca kendi randevularını görür ve yönetir', async () => {
    const list = await api().get('/api/appointments').set(auth(customer.token));
    assert.equal(list.body.data.items.length, 1);
    const { id } = list.body.data.items[0];

    assert.equal((await api().get(`/api/appointments/${id}`).set(auth(customer.token))).status, 200);
    assert.equal((await api().get(`/api/appointments/${id}`).set(auth(stranger.token))).status, 404);
    assert.equal((await api().patch(`/api/appointments/${id}`).set(auth(stranger.token)).send({ notes: 'x' })).status, 404);
    assert.equal((await api().delete(`/api/appointments/${id}`).set(auth(stranger.token))).status, 404);

    const mine = await api().get('/api/users/me/appointments').query({ scope: 'upcoming' }).set(auth(customer.token));
    assert.equal(mine.body.data.items.length, 1);
    assert.equal((await api().get('/api/users/me/appointments').set(auth(stranger.token))).body.data.items.length, 0);
  });

  it('müşteri randevusunu taşıyabilir; dolu saate taşıyamaz', async () => {
    const { id } = (await api().get('/api/appointments').set(auth(customer.token))).body.data.items[0];

    const conflict = await api().patch(`/api/appointments/${id}`).set(auth(customer.token)).send({ startTime: '14:30' });
    assert.equal(conflict.status, 409);

    const moved = await api().patch(`/api/appointments/${id}`).set(auth(customer.token)).send({ startTime: '16:00', status: 'COMPLETED' });
    assert.equal(moved.status, 200);
    assert.equal(moved.body.data.startTime, '16:00');
    assert.equal(moved.body.data.endTime, '17:00');
    assert.equal(moved.body.data.status, 'BOOKED');

    assert.equal((await book(stranger.token, body({ startTime: '09:00' }))).status, 201);
  });

  it('iptal edilen randevu CANCELLED olur, saat yeniden alınabilir ve tekrar iptal edilemez', async () => {
    const { id } = (await api().get('/api/appointments').set(auth(customer.token))).body.data.items[0];

    const cancelled = await api().delete(`/api/appointments/${id}`).set(auth(customer.token)).send({ reason: 'Planlarım değişti' });
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.body.data.status, 'CANCELLED');
    assert.equal(cancelled.body.data.cancellationReason, 'Planlarım değişti');

    assert.equal((await api().delete(`/api/appointments/${id}`).set(auth(customer.token))).status, 409);
    assert.equal((await api().patch(`/api/appointments/${id}`).set(auth(customer.token)).send({ notes: 'x' })).status, 409);
    assert.equal((await book(stranger.token, body({ startTime: '16:00' }))).status, 201);
  });

  describe('salon yönetimi', () => {
    let manual;

    it('salon elle randevu ekler ve doğrudan BOOKED olur', async () => {
      const response = await api()
        .post('/api/salon/me/appointments')
        .set(auth(salon.token))
        .send({ customerName: 'Deniz Kara', customerPhone: '0533 111 22 33', serviceId: service.id, date, startTime: '11:00' });
      assert.equal(response.status, 201);
      manual = response.body.data;
      assert.equal(manual.status, 'BOOKED');
      assert.equal(manual.source, 'MANUAL');
      assert.equal(manual.customer, null);

      const taken = await api()
        .post('/api/salon/me/appointments')
        .set(auth(salon.token))
        .send({ customerName: 'Başka', customerPhone: '0533', serviceId: service.id, date, startTime: '11:00' });
      assert.equal(taken.status, 409);
    });

    it('salon yalnızca kendi randevularını listeler ve yönetir', async () => {
      const own = await api().get('/api/salon/me/appointments').query({ date, status: 'BOOKED' }).set(auth(salon.token));
      assert.equal(own.status, 200);
      assert.ok(own.body.data.items.length >= 3);
      assert.ok(own.body.data.items.every((item) => item.salon === salon.salon.id));

      const foreign = await api().get('/api/salon/me/appointments').set(auth(otherSalon.token));
      assert.equal(foreign.body.data.items.length, 0);

      const url = `/api/salon/me/appointments/${manual.id}`;
      assert.equal((await api().patch(url).set(auth(otherSalon.token)).send({ notes: 'x' })).status, 404);
      assert.equal((await api().delete(url).set(auth(otherSalon.token))).status, 404);
    });

    it('salon randevuyu düzenler; geçersiz durumları ve erken tamamlamayı reddeder', async () => {
      const url = `/api/salon/me/appointments/${manual.id}`;

      const edited = await api().patch(url).set(auth(salon.token)).send({ startTime: '17:00', notes: 'Saat değişti', customerName: 'Deniz K.' });
      assert.equal(edited.status, 200);
      assert.equal(edited.body.data.startTime, '17:00');
      assert.equal(edited.body.data.customerName, 'Deniz K.');

      for (const status of ['PENDING', 'CONFIRMED', 'BOOKED']) {
        assert.equal((await api().patch(url).set(auth(salon.token)).send({ status })).status, 400, status);
      }
      assert.equal((await api().patch(url).set(auth(salon.token)).send({ status: 'COMPLETED' })).status, 409, 'henüz başlamadı');
      assert.equal((await api().patch(url).set(auth(salon.token)).send({ status: 'NO_SHOW', notes: 'x' })).status, 400);

      const cancelled = await api().delete(url).set(auth(salon.token));
      assert.equal(cancelled.body.data.status, 'CANCELLED');
    });

    it('ileri tarihli randevusu olan hizmet silinemez', async () => {
      const response = await api().delete(`/api/salon/me/services/${service.id}`).set(auth(salon.token));
      assert.equal(response.status, 409);
    });
  });
});

describe('değerlendirme, rıza ve portföy', () => {
  let salon, service, customer, secondCustomer, stranger, Appointment;
  const past = addDays(getSalonNow().date, -3);

  async function seedPastAppointment(owner, startTime) {
    const appointment = await Appointment.create({
      reference: `SL-T${startTime.replace(':', '')}${owner.user.id.slice(-4)}`,
      customer: owner.user.id,
      customerName: owner.user.name,
      salon: salon.salon.id,
      service: service.id,
      serviceName: service.name,
      duration: 60,
      price: 600,
      date: past,
      startTime,
      endTime: `${String(Number(startTime.slice(0, 2)) + 1).padStart(2, '0')}:00`,
    });
    return appointment.id;
  }

  const complete = (id) => api().patch(`/api/salon/me/appointments/${id}`).set(auth(salon.token)).send({ status: 'COMPLETED' });
  const review = (token, id, payload) => api().post(`/api/appointments/${id}/review`).set(auth(token)).send(payload);

  before(async () => {
    ({ Appointment } = await import('../src/models/Appointment.js'));
    salon = await registerSalon();
    customer = await registerCustomer({ name: 'Zeynep Baş' });
    secondCustomer = await registerCustomer({ name: 'Gizli Müşteri' });
    stranger = await registerCustomer();
    service = await createService(salon.token);
  });

  it('tamamlanmamış randevu değerlendirilemez', async () => {
    const id = await seedPastAppointment(customer, '09:00');
    const response = await review(customer.token, id, { rating: 5 });
    assert.equal(response.status, 409);
    assert.equal((await api().delete(`/api/appointments/${id}`).set(auth(customer.token))).status, 409, 'başlamış randevu iptal edilemez');
  });

  it('salon randevuyu tamamlar; müşteriye değerlendirme bildirimi gider', async () => {
    const id = (await Appointment.findOne({ customer: customer.user.id })).id;
    const completed = await complete(id);
    assert.equal(completed.status, 200);
    assert.equal(completed.body.data.status, 'COMPLETED');
    assert.equal((await complete(id)).status, 409, 'son durum değiştirilemez');

    const notifications = await api().get('/api/notifications').set(auth(customer.token));
    const types = notifications.body.data.items.map((item) => item.type);
    assert.ok(types.includes('APPOINTMENT_COMPLETED'));
    assert.ok(types.includes('REVIEW_REQUESTED'));
  });

  it('doğrulama ve sahiplik kontrollerini uygular', async () => {
    const id = (await Appointment.findOne({ customer: customer.user.id })).id;
    assert.equal((await review(customer.token, id, { rating: 6 })).status, 400);
    assert.equal((await review(customer.token, id, { rating: 0 })).status, 400);
    assert.equal((await review(customer.token, id, { rating: 4.5 })).status, 400);
    assert.equal((await review(customer.token, id, { rating: 5, hairPhoto: 'javascript:alert(1)' })).status, 400);
    assert.equal((await review(stranger.token, id, { rating: 1 })).status, 404, 'başkasının randevusu');
    assert.equal((await review(salon.token, id, { rating: 5 })).status, 403);
  });

  it('izin verilen değerlendirme herkese açık olur; ikinci değerlendirme reddedilir', async () => {
    const id = (await Appointment.findOne({ customer: customer.user.id })).id;
    const payload = { rating: 5, comment: 'Harika oldu.', hairPhoto: 'https://img.test/sac.jpg', isPublic: true };

    const created = await review(customer.token, id, payload);
    assert.equal(created.status, 201);
    assert.equal(created.body.data.isPublic, true);
    assert.equal((await review(customer.token, id, payload)).status, 409);

    const publicReviews = await api().get(`/api/salons/${salon.salon.id}/reviews`);
    assert.equal(publicReviews.body.data.items.length, 1);
    assert.equal(publicReviews.body.data.items[0].authorName, 'Zeynep Baş');
    assert.equal(publicReviews.body.data.items[0].customer, undefined);
    assert.equal(publicReviews.body.data.summary.averageRating, 5);

    const appointment = await api().get(`/api/appointments/${id}`).set(auth(customer.token));
    assert.equal(appointment.body.data.isReviewed, true);
  });

  it('eş zamanlı iki değerlendirmeden yalnızca biri kaydedilir', async () => {
    const id = await seedPastAppointment(stranger, '15:00');
    await complete(id);
    const responses = await Promise.all([1, 2, 3].map(() => review(stranger.token, id, { rating: 4 })));
    assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409, 409]);
  });

  it('izin verilmeyen değerlendirme özel kalır ama ortalamaya dahil edilir', async () => {
    const id = await seedPastAppointment(secondCustomer, '11:00');
    await complete(id);

    const created = await review(secondCustomer.token, id, { rating: 2, comment: 'Özel yorum', hairPhoto: 'https://img.test/gizli.jpg' });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.isPublic, false);

    const publicReviews = await api().get(`/api/salons/${salon.salon.id}/reviews`);
    const text = JSON.stringify(publicReviews.body);
    assert.equal(publicReviews.body.data.items.length, 1);
    assert.ok(!text.includes('Gizli Müşteri') && !text.includes('Özel yorum') && !text.includes('gizli.jpg'));
    assert.equal(publicReviews.body.data.summary.reviewCount, 3);
    assert.equal(publicReviews.body.data.summary.averageRating, 3.7);

    const detail = await api().get(`/api/salons/${salon.salon.id}`);
    assert.equal(detail.body.data.reviewCount, 3);
    assert.ok(!JSON.stringify(detail.body).includes('gizli.jpg'));

    const mine = await api().get('/api/users/me/reviews').set(auth(secondCustomer.token));
    assert.equal(mine.body.data.items.length, 1);
    assert.equal(mine.body.data.items[0].comment, 'Özel yorum');
    assert.equal((await api().get('/api/users/me/reviews').set(auth(customer.token))).body.data.items.length, 1);
  });

  it('müşteri fotoğrafı yalnızca izin varsa ve salon yayınlarsa portföyde görünür', async () => {
    const panel = await api().get('/api/salon/me/portfolio').set(auth(salon.token));
    assert.equal(panel.body.data.length, 2);
    const consented = panel.body.data.find((item) => item.hasConsent);
    const withheld = panel.body.data.find((item) => !item.hasConsent);
    const publicUrl = `/api/salons/${salon.salon.id}/portfolio`;

    assert.deepEqual((await api().get(publicUrl)).body.data, []);

    const blocked = await api().patch(`/api/salon/me/portfolio/${withheld.id}`).set(auth(salon.token)).send({ isPublished: true });
    assert.equal(blocked.status, 403);

    const published = await api().patch(`/api/salon/me/portfolio/${consented.id}`).set(auth(salon.token)).send({ isPublished: true });
    assert.equal(published.status, 200);

    const publicItems = (await api().get(publicUrl)).body.data;
    assert.equal(publicItems.length, 1);
    assert.equal(publicItems[0].image, 'https://img.test/sac.jpg');
  });

  it('salon kendi görsellerini ekler, günceller ve siler; başkasınınkine dokunamaz', async () => {
    const other = await registerSalon();
    const created = await api()
      .post('/api/salon/me/portfolio')
      .set(auth(salon.token))
      .send({ image: 'https://img.test/salon.jpg', title: 'Balayage', description: 'Doğal geçiş' });
    assert.equal(created.status, 201);
    const url = `/api/salon/me/portfolio/${created.body.data.id}`;

    assert.equal((await api().patch(url).set(auth(other.token)).send({ title: 'x' })).status, 404);
    assert.equal((await api().delete(url).set(auth(other.token))).status, 404);
    assert.equal((await api().post('/api/salon/me/portfolio').set(auth(salon.token)).send({ image: 'resim' })).status, 400);

    assert.equal((await api().patch(url).set(auth(salon.token)).send({ title: 'Yeni başlık' })).body.data.title, 'Yeni başlık');
    assert.equal((await api().get(`/api/salons/${salon.salon.id}/portfolio`)).body.data.length, 2);
    assert.equal((await api().delete(url).set(auth(salon.token))).status, 200);
    assert.equal((await api().get(`/api/salons/${salon.salon.id}/portfolio`)).body.data.length, 1);
  });

  it('dashboard özetini döner', async () => {
    const response = await api().get('/api/salon/me/dashboard').set(auth(salon.token));
    assert.equal(response.status, 200);
    const data = response.body.data;
    assert.ok(Array.isArray(data.todayAppointments));
    assert.ok(Array.isArray(data.upcomingAppointments));
    assert.equal(typeof data.completedAppointments, 'number');
    assert.equal(typeof data.cancelledAppointments, 'number');
    assert.equal(data.averageRating, 3.7);
    assert.equal(data.reviewCount, 3);
  });
});

describe('bildirimler', () => {
  let salon, customer, other, appointmentId;

  before(async () => {
    salon = await registerSalon();
    customer = await registerCustomer();
    other = await registerCustomer();
    const service = await createService(salon.token);
    const date = openDay(5);

    const booked = await book(customer.token, { salonId: salon.salon.id, serviceId: service.id, date, startTime: '10:00' });
    appointmentId = booked.body.data.id;
    await api().patch(`/api/salon/me/appointments/${appointmentId}`).set(auth(salon.token)).send({ startTime: '15:00' });
    await api().delete(`/api/appointments/${appointmentId}`).set(auth(customer.token));
  });

  it('randevu olaylarında iki tarafa da bildirim oluşturur', async () => {
    const forCustomer = await api().get('/api/notifications').set(auth(customer.token));
    assert.deepEqual(
      forCustomer.body.data.items.map((item) => item.type),
      ['APPOINTMENT_CANCELLED', 'APPOINTMENT_UPDATED', 'APPOINTMENT_CREATED'],
    );
    assert.equal(forCustomer.body.data.unreadCount, 3);
    assert.equal(forCustomer.body.data.items[0].appointment, appointmentId);

    const forSalon = await api().get('/api/notifications').set(auth(salon.token));
    assert.deepEqual(
      forSalon.body.data.items.map((item) => item.type),
      ['APPOINTMENT_CANCELLED', 'APPOINTMENT_CREATED'],
    );
    assert.equal(forSalon.body.data.items[1].title, 'Yeni randevu');

    assert.equal((await api().get('/api/notifications').set(auth(other.token))).body.data.items.length, 0);
    assert.equal((await api().get('/api/users/me/notifications').set(auth(customer.token))).body.data.items.length, 3);
  });

  it('okundu işaretler; başkasının bildirimine dokunamaz', async () => {
    const { items } = (await api().get('/api/notifications').set(auth(customer.token))).body.data;

    assert.equal((await api().patch(`/api/notifications/${items[0].id}/read`).set(auth(other.token))).status, 404);

    const read = await api().patch(`/api/notifications/${items[0].id}/read`).set(auth(customer.token));
    assert.equal(read.body.data.isRead, true);

    const unread = await api().get('/api/notifications').query({ unreadOnly: 'true' }).set(auth(customer.token));
    assert.equal(unread.body.data.items.length, 2);

    const all = await api().patch('/api/notifications/read-all').set(auth(customer.token));
    assert.deepEqual(all.body.data, { updatedCount: 2 });
    assert.equal((await api().get('/api/notifications').set(auth(customer.token))).body.data.unreadCount, 0);
    assert.equal((await api().get('/api/notifications').set(auth(salon.token))).body.data.unreadCount, 2);
  });

  it('tek bildirimi ve tümünü siler; başkasının bildirimini silemez', async () => {
    const { items } = (await api().get('/api/notifications').set(auth(salon.token))).body.data;

    assert.equal((await api().delete(`/api/notifications/${items[0].id}`).set(auth(other.token))).status, 404);

    const removed = await api().delete(`/api/notifications/${items[0].id}`).set(auth(salon.token));
    assert.deepEqual(removed.body.data, { id: items[0].id });
    assert.equal((await api().get('/api/notifications').set(auth(salon.token))).body.data.items.length, 1);

    const all = await api().delete('/api/notifications').set(auth(salon.token));
    assert.deepEqual(all.body.data, { deletedCount: 1 });
    assert.equal((await api().get('/api/notifications').set(auth(salon.token))).body.data.items.length, 0);
    assert.equal((await api().get('/api/notifications').set(auth(customer.token))).body.data.items.length, 3);
  });
});

describe('profil: şifre değiştirme ve hesap silme', () => {
  const login = (email, password) => api().post('/api/auth/login').send({ email, password });

  it('profil konumunu kaydeder', async () => {
    const customer = await registerCustomer();
    const response = await api().patch('/api/users/me').set(auth(customer.token)).send({ location: { city: 'İstanbul', district: 'Kadıköy' } });
    assert.deepEqual(response.body.data.user.location, { city: 'İstanbul', district: 'Kadıköy' });
  });

  it('mevcut şifre doğruysa şifreyi değiştirir ve diğer oturumları kapatır', async () => {
    const customer = await registerCustomer({ email: 'sifre@test.com' });
    const oldCookie = customer.response.headers['set-cookie'][0].split(';')[0];
    const url = '/api/users/me/password';

    assert.equal((await api().patch(url).send({ currentPassword: 'gizli-sifre-1', newPassword: 'yeni-sifre-22' })).status, 401);
    assert.equal((await api().patch(url).set(auth(customer.token)).send({ currentPassword: 'yanlis', newPassword: 'yeni-sifre-22' })).status, 400);
    assert.equal((await api().patch(url).set(auth(customer.token)).send({ currentPassword: 'gizli-sifre-1', newPassword: 'kisa' })).status, 400);
    assert.equal((await api().patch(url).set(auth(customer.token)).send({ currentPassword: 'gizli-sifre-1', newPassword: 'gizli-sifre-1' })).status, 400);

    const changed = await api().patch(url).set(auth(customer.token)).send({ currentPassword: 'gizli-sifre-1', newPassword: 'yeni-sifre-22' });
    assert.equal(changed.status, 200);
    assert.ok(changed.body.data.accessToken);
    assert.equal(changed.body.data.user.passwordHash, undefined);

    assert.equal((await login('sifre@test.com', 'gizli-sifre-1')).status, 401);
    assert.equal((await login('sifre@test.com', 'yeni-sifre-22')).status, 200);
    assert.equal((await api().post('/api/auth/refresh').set('Cookie', oldCookie)).status, 401, 'eski oturum kapanmalı');
  });

  it('hesap silinince kişisel veriler kaldırılır, salon kayıtları kimliksizleşir', async () => {
    const { Appointment } = await import('../src/models/Appointment.js');
    const salon = await registerSalon();
    const service = await createService(salon.token);
    const customer = await registerCustomer({ email: 'silinecek@test.com', name: 'Silinecek Kişi' });
    const date = openDay(6);

    const future = await book(customer.token, { salonId: salon.salon.id, serviceId: service.id, date, startTime: '10:00' });
    const past = await Appointment.create({
      reference: 'SL-DELETE01',
      customer: customer.user.id,
      customerName: customer.user.name,
      customerPhone: '0532 000 00 00',
      salon: salon.salon.id,
      service: service.id,
      serviceName: service.name,
      duration: 60,
      price: 600,
      date: addDays(getSalonNow().date, -2),
      startTime: '10:00',
      endTime: '11:00',
      status: 'COMPLETED',
    });
    await api().post(`/api/appointments/${past.id}/review`).set(auth(customer.token)).send({ rating: 5, comment: 'Silinecek yorum', isPublic: true });
    assert.equal((await api().get(`/api/salons/${salon.salon.id}`)).body.data.reviewCount, 1);

    assert.equal((await api().delete('/api/users/me').set(auth(customer.token)).send({ password: 'yanlis' })).status, 400);
    assert.equal((await api().delete('/api/users/me').set(auth(salon.token)).send({ password: 'gizli-sifre-1' })).status, 403);

    const deleted = await api().delete('/api/users/me').set(auth(customer.token)).send({ password: 'gizli-sifre-1' });
    assert.equal(deleted.status, 200);

    assert.equal((await login('silinecek@test.com', 'gizli-sifre-1')).status, 401);
    assert.equal((await api().get('/api/users/me').set(auth(customer.token))).status, 401, 'eski token artık geçersiz');

    const detail = (await api().get(`/api/salons/${salon.salon.id}`)).body.data;
    assert.equal(detail.reviewCount, 0);
    assert.equal(detail.rating, 0);
    assert.equal((await api().get(`/api/salons/${salon.salon.id}/reviews`)).body.data.items.length, 0);

    const appointments = (await api().get('/api/salon/me/appointments').set(auth(salon.token))).body.data.items;
    assert.equal(appointments.length, 2, 'salonun kayıtları silinmez');
    assert.ok(appointments.every((item) => item.customer === null && item.customerName === 'Silinmiş kullanıcı' && item.customerPhone === ''));
    assert.equal(appointments.find((item) => item.id === future.body.data.id).status, 'CANCELLED');
    assert.ok(!JSON.stringify(appointments).includes('Silinecek Kişi'));

    const other = await registerCustomer();
    assert.equal((await book(other.token, { salonId: salon.salon.id, serviceId: service.id, date, startTime: '10:00' })).status, 201);
  });
});

describe('görsel yükleme', () => {
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  let customer;

  before(async () => {
    customer = await registerCustomer();
  });

  it('görseli yükler ve herkese açık adresten aynı içeriği sunar', async () => {
    const uploaded = await api().post('/api/uploads').set(auth(customer.token)).attach('file', PNG, 'sac.png');
    assert.equal(uploaded.status, 201);
    assert.equal(uploaded.body.data.contentType, 'image/png');
    assert.match(uploaded.body.data.url, /^http:\/\/.+\/api\/uploads\/[0-9a-f]{24}$/);

    const fetched = await api().get(`/api/uploads/${uploaded.body.data.id}`).buffer(true).parse((res, done) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => done(null, Buffer.concat(chunks)));
    });
    assert.equal(fetched.status, 200);
    assert.equal(fetched.headers['content-type'], 'image/png');
    assert.equal(fetched.headers['cross-origin-resource-policy'], 'cross-origin');
    assert.ok(fetched.body.equals(PNG));
  });

  it('girişsiz, görsel olmayan ve çok büyük yüklemeleri reddeder', async () => {
    assert.equal((await api().post('/api/uploads').attach('file', PNG, 'sac.png')).status, 401);
    assert.equal((await api().post('/api/uploads').set(auth(customer.token))).status, 400);

    const fake = await api()
      .post('/api/uploads')
      .set(auth(customer.token))
      .attach('file', Buffer.from('<script>alert(1)</script>'), { filename: 'sac.png', contentType: 'image/png' });
    assert.equal(fake.status, 400);

    const huge = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);
    assert.equal((await api().post('/api/uploads').set(auth(customer.token)).attach('file', huge, 'buyuk.png')).status, 413);

    assert.equal((await api().get('/api/uploads/64b000000000000000000000')).status, 404);
    assert.equal((await api().get('/api/uploads/abc')).status, 400);
  });

  it('değerlendirme birden fazla fotoğraf alır; her biri portföy havuzuna düşer', async () => {
    const { Appointment } = await import('../src/models/Appointment.js');
    const salon = await registerSalon();
    const service = await createService(salon.token);
    const appointment = await Appointment.create({
      reference: 'SL-PHOTOS01',
      customer: customer.user.id,
      customerName: customer.user.name,
      salon: salon.salon.id,
      service: service.id,
      serviceName: service.name,
      duration: 60,
      price: 600,
      date: addDays(getSalonNow().date, -1),
      startTime: '10:00',
      endTime: '11:00',
      status: 'COMPLETED',
    });
    const url = `/api/appointments/${appointment.id}/review`;
    const photos = [1, 2, 3, 4, 5].map((index) => `https://img.test/${index}.jpg`);

    assert.equal((await api().post(url).set(auth(customer.token)).send({ rating: 5, hairPhotos: photos })).status, 400, 'en fazla 4');

    const created = await api().post(url).set(auth(customer.token)).send({ rating: 4, hairPhotos: photos.slice(0, 2), isPublic: true });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.data.hairPhotos, photos.slice(0, 2));
    assert.equal(created.body.data.hairPhoto, photos[0]);

    const portfolio = await api().get('/api/salon/me/portfolio').set(auth(salon.token));
    assert.equal(portfolio.body.data.length, 2);

    const summary = (await api().get(`/api/salons/${salon.salon.id}/reviews`)).body.data.summary;
    assert.deepEqual(summary.distribution.find((row) => row.stars === 4), { stars: 4, count: 1, percent: 100 });
  });
});

describe('konum ve uygunluk filtreleri', () => {
  const origin = { lat: 39.9208, lng: 32.8541 };
  let near, far, noLocation, closed;
  const list = async (query) => (await api().get('/api/salons').query({ city: 'Ankara', ...query })).body.data;

  before(async () => {
    const salonIn = (name, coordinates) =>
      registerSalon({ salon: { name, city: 'Ankara', district: 'Çankaya', ...(coordinates && { coordinates }) } });

    near = await salonIn('Yakın Salon', { lat: 39.9298, lng: 32.8541 });
    far = await salonIn('Uzak Salon', { lat: 40.0008, lng: 32.8541 });
    noLocation = await salonIn('Konumsuz Salon');
    closed = await salonIn('Kapalı Salon');

    await createService(near.token);
    await createService(far.token);
    await createService(closed.token);
    await api()
      .patch('/api/salon/me/working-hours')
      .set(auth(closed.token))
      .send({ days: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, openTime: '09:00', closeTime: '19:00', isClosed: true })) });
  });

  it('konum verilince mesafeyi ekler; konumu olmayan salonda null döner', async () => {
    const { items } = await list(origin);
    const byName = Object.fromEntries(items.map((item) => [item.name, item]));
    assert.equal(items.length, 4);
    assert.equal(byName['Yakın Salon'].distanceKm, 1);
    assert.ok(byName['Uzak Salon'].distanceKm > 8 && byName['Uzak Salon'].distanceKm < 10);
    assert.equal(byName['Konumsuz Salon'].distanceKm, null);
    assert.deepEqual(byName['Yakın Salon'].coordinates, { lat: 39.9298, lng: 32.8541 });
    assert.equal(byName['Yakın Salon'].location, undefined);
    assert.equal((await list({})).items[0].distanceKm, undefined);
  });

  it('mesafeye göre filtreler ve en yakına göre sıralar', async () => {
    const within = await list({ ...origin, distance: 5 });
    assert.deepEqual(within.items.map((item) => item.name), ['Yakın Salon']);
    assert.equal(within.pagination.total, 1);

    const nearest = await list({ ...origin, sort: 'nearest' });
    assert.deepEqual(nearest.items.map((item) => item.name), ['Yakın Salon', 'Uzak Salon']);
    assert.equal(nearest.pagination.total, 2);

    const nearestWithin = await list({ ...origin, sort: 'nearest', distance: 20, limit: 1, page: 2 });
    assert.deepEqual(nearestWithin.items.map((item) => item.name), ['Uzak Salon']);
    assert.equal(nearestWithin.pagination.total, 2);
  });

  it('konum olmadan mesafe isteklerini reddeder', async () => {
    assert.equal((await api().get('/api/salons').query({ distance: 5 })).status, 400);
    assert.equal((await api().get('/api/salons').query({ sort: 'nearest' })).status, 400);
    assert.equal((await api().get('/api/salons').query({ lat: 39.9 })).status, 400);
    assert.equal((await api().get('/api/salons').query({ lat: 120, lng: 32 })).status, 400);
  });

  it('salon koordinatını günceller ve kaldırır', async () => {
    const set = await api().patch('/api/salon/me').set(auth(noLocation.token)).send({ coordinates: { lat: 39.93, lng: 32.86 } });
    assert.deepEqual(set.body.data.coordinates, { lat: 39.93, lng: 32.86 });
    const cleared = await api().patch('/api/salon/me').set(auth(noLocation.token)).send({ coordinates: null });
    assert.equal(cleared.body.data.coordinates, null);
  });

  it('uygunluk filtresi boş saati olmayan salonları eler', async () => {
    const week = await list({ availability: 'week' });
    assert.deepEqual(week.items.map((item) => item.name).sort(), ['Uzak Salon', 'Yakın Salon']);
    assert.equal(week.pagination.total, 2);

    const today = await api().get('/api/salons').query({ city: 'Ankara', availability: 'today' });
    assert.equal(today.status, 200);
    assert.ok(today.body.data.items.every((item) => ['Uzak Salon', 'Yakın Salon'].includes(item.name)));
    assert.equal((await api().get('/api/salons').query({ availability: 'someday' })).status, 400);
  });

  it('gün tamamen dolunca salon o gün için müsait sayılmaz', async () => {
    const { filterSalonsWithOpenSlot } = await import('../src/services/availability.service.js');
    const { Appointment } = await import('../src/models/Appointment.js');
    const { WorkingHours } = await import('../src/models/WorkingHours.js');
    const today = getSalonNow().date;
    const salonId = near.salon.id;

    await WorkingHours.updateMany({ salon: salonId }, { isClosed: true });
    await WorkingHours.updateOne({ salon: salonId, dayOfWeek: getDayOfWeek(today) }, { isClosed: false, openTime: '00:00', closeTime: '23:30', breaks: [] });
    const service = (await api().get(`/api/salons/${salonId}/services`)).body.data[0];
    const fullDay = await Appointment.create({
      reference: 'SL-FULLDAY1',
      customerName: 'Tüm Gün',
      salon: salonId,
      service: service.id,
      serviceName: service.name,
      duration: 1410,
      price: 0,
      date: today,
      startTime: '00:00',
      endTime: '23:30',
    });

    const { Types } = await import('mongoose');
    const id = new Types.ObjectId(salonId);
    assert.deepEqual(await filterSalonsWithOpenSlot([id], 6), []);
    await Appointment.updateOne({ _id: fullDay._id }, { status: 'CANCELLED' });
    if (getSalonNow().minutes < 22 * 60) assert.deepEqual(await filterSalonsWithOpenSlot([id], 6), [id]);
  });
});

describe('panel: randevu sekmeleri ve günlük özet', () => {
  let salon, service;

  before(async () => {
    const { Appointment } = await import('../src/models/Appointment.js');
    salon = await registerSalon();
    service = await createService(salon.token, { duration: 30 });
    const today = getSalonNow().date;
    const base = { salon: salon.salon.id, service: service.id, serviceName: service.name, duration: 30, price: 600 };

    await Appointment.create([
      { ...base, reference: 'SL-TAB00001', customerName: 'Elif Demir', date: addDays(today, -1), startTime: '10:00', endTime: '10:30', status: 'COMPLETED' },
      { ...base, reference: 'SL-TAB00002', customerName: 'Mert Güneş', date: today, startTime: '00:00', endTime: '00:30' },
      { ...base, reference: 'SL-TAB00003', customerName: 'Selin Aksoy', date: addDays(today, 2), startTime: '10:00', endTime: '10:30' },
      { ...base, reference: 'SL-TAB00004', customerName: 'Elif Kaya', date: addDays(today, 3), startTime: '10:00', endTime: '10:30', status: 'CANCELLED' },
    ]);
  });

  const list = async (query) => (await api().get('/api/salon/me/appointments').query(query).set(auth(salon.token))).body.data;

  it('sekmeye göre filtreler ve sekme sayılarını döner', async () => {
    const names = async (query) => (await list(query)).items.map((item) => item.customerName);

    assert.deepEqual(await names({ scope: 'today' }), ['Mert Güneş']);
    assert.deepEqual(await names({ scope: 'upcoming' }), ['Mert Güneş', 'Selin Aksoy']);
    assert.deepEqual(await names({ scope: 'past' }), ['Elif Kaya', 'Elif Demir']);
    assert.equal((await names({ scope: 'all' })).length, 4);
    assert.deepEqual((await list({ scope: 'today' })).counts, { today: 1, upcoming: 2, past: 2, all: 4 });
  });

  it('dashboard doluluk ve boş saat bilgisini içerir', async () => {
    const data = (await api().get('/api/salon/me/dashboard').set(auth(salon.token))).body.data;
    assert.equal(data.todayAppointments.length, 1);
    assert.equal(data.upcomingCount, 1);
    assert.equal(typeof data.today.occupancy, 'number');
    assert.ok(data.today.occupancy >= 0 && data.today.occupancy <= 100);
    assert.equal(typeof data.today.freeSlotCount, 'number');
  });
});

describe('genel', () => {
  it('bilinmeyen yol ve bozuk JSON için tutarlı hata döner', async () => {
    const missing = await api().get('/api/yok');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.success, false);

    const broken = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{bozuk');
    assert.equal(broken.status, 400);
    assert.deepEqual(broken.body, { success: false, message: 'Gönderilen JSON geçersiz.' });
  });

  it('güvenlik başlıklarını ekler', async () => {
    const response = await api().get('/api/health');
    assert.equal(response.status, 200);
    assert.equal(response.headers['x-powered-by'], undefined);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
  });
});
