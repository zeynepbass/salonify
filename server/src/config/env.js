import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Secret değerler (MongoDB URI, JWT anahtarları) koda yazılmaz; yalnızca
// environment üzerinden gelir. Eksik bir değerle uygulamayı ayağa kaldırıp
// ilk istekte anlaşılmaz bir hatayla karşılaşmak yerine, açılışta net bir
// mesajla duruyoruz ("fail fast").
const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  throw new Error(
    `Eksik environment değişkenleri: ${missing.join(', ')}. .env.example dosyasını .env olarak kopyalayıp doldurun.`,
  );
}

// Atlas'ın verdiği şablondaki <db_password> gibi alanlar doldurulmadan
// bırakılırsa bağlantı "authentication failed" hatasıyla düşer. Sebebi
// daha anlaşılır kılmak için bunu bağlanmadan önce yakalıyoruz.
if (/<[^>]+>/.test(process.env.MONGODB_URI)) {
  throw new Error('MONGODB_URI içinde doldurulmamış bir alan var (ör. <db_password>). Gerçek değeri .env dosyasına yazın.');
}

// Access ve refresh token'lar aynı anahtarla imzalanırsa, ele geçirilen bir
// refresh token access token gibi kullanılabilir. Bu yüzden iki anahtarın
// farklı olmasını zorunlu tutuyoruz.
if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET ve JWT_REFRESH_SECRET farklı değerler olmalı.');
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenTtl: '15m',
  refreshTokenTtlDays: 7,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
});
