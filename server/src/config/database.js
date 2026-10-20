import mongoose from 'mongoose';
import { env } from './env.js';

// MongoDB bağlantısını neden ayrı bir dosyada tutuyoruz?
//
// 1. Tek sorumluluk: app.js yalnızca HTTP katmanını (middleware + route)
//    kurar; veritabanına nasıl bağlanıldığını bilmez. Böylece testlerde aynı
//    app'i farklı bir veritabanına (in-memory MongoDB) bağlayabiliyoruz.
// 2. Güvenlik: Bağlantı adresi yalnızca environment'tan okunur. URI içinde
//    kullanıcı adı ve şifre bulunduğu için hiçbir yerde loglanmaz.
// 3. Tek bağlantı havuzu: Mongoose bağlantıyı process genelinde paylaşır.
//    Bağlantıyı tek yerden açıp kapatmak, yanlışlıkla ikinci bir bağlantı
//    açılmasını ve kapanışta açık kalan soketleri önler.

mongoose.set('strictQuery', true);

export async function connectDatabase(uri = env.mongodbUri) {
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB bağlantı hatası:', error.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB bağlantısı koptu.');
  });

  // Atlas'a ulaşılamıyorsa (yanlış şifre, IP izin listesi vb.) varsayılan
  // 30 saniye yerine 10 saniyede hata alıp sebebi hızlıca görmek için.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

  // Mongoose index'leri arka planda oluşturur. Double booking koruması
  // Appointment üzerindeki unique index'e dayandığı için, index'ler hazır
  // olmadan istek kabul etmek kısa bir süre korumasız kalmak demektir.
  // Bu yüzden sunucu dinlemeye başlamadan önce index'lerin bitmesini bekliyoruz.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

  console.info(`MongoDB bağlantısı kuruldu (veritabanı: ${mongoose.connection.name}).`);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
