import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiters.js';
import routes from './routes/index.js';

// app.js yalnızca Express uygulamasını kurar; portu dinlemez ve veritabanına
// bağlanmaz (bunlar server.js'in işi). Bu ayrım sayesinde testler sunucu
// başlatmadan aynı uygulamayı doğrudan çağırabilir.
const app = express();

// Uygulama production'da bir proxy / load balancer arkasında çalışır.
// Bu ayar olmadan bütün istekler proxy'nin IP'sinden geliyor görünür ve
// rate limit herkesi tek kullanıcı sayar.
if (env.isProduction) app.set('trust proxy', 1);

app.disable('x-powered-by');

// Güvenlikle ilgili HTTP başlıklarını ekler (MIME sniffing, clickjacking vb.).
app.use(helmet());

// Yalnızca tanımlı frontend adreslerinden gelen tarayıcı isteklerine izin
// verilir. credentials: true, refresh token cookie'sinin gönderilebilmesi
// için gereklidir ve "*" origin ile birlikte kullanılamaz.
app.use(cors({ origin: env.clientUrls, credentials: true }));

app.use('/api', apiLimiter);

// Gövde boyutunu sınırlamak, çok büyük isteklerle belleği doldurma
// girişimlerini engeller.
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
