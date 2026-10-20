import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function start() {
  // Önce veritabanı, sonra HTTP: bağlantı kurulamadıysa istek kabul etmenin
  // bir anlamı yok.
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.info(`API http://localhost:${env.port}/api adresinde çalışıyor (${env.nodeEnv}).`);
  });

  // Kapanış sinyalinde yeni istek almayı bırakıp devam edenlerin bitmesini
  // bekliyoruz; ardından veritabanı bağlantısını düzgünce kapatıyoruz.
  const shutdown = (signal) => {
    console.info(`${signal} alındı, sunucu kapatılıyor...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Sunucu başlatılamadı:', error.message);
  process.exit(1);
});
