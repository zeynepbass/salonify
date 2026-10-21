import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiters.js';
import routes from './routes/index.js';

const app = express();

if (env.isProduction) app.set('trust proxy', 1);

app.disable('x-powered-by');

app.use(helmet());

app.use(cors({ origin: env.clientUrls, credentials: true }));

app.use('/api', apiLimiter);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
