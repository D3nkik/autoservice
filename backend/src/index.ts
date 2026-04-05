import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import slotsRoutes from './routes/slots';
import bookingsRoutes from './routes/bookings';
import meRoutes from './routes/me';
import adminRoutes from './routes/admin';

import { startCronJobs } from './services/cron';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Слишком много запросов' });
app.use('/api/auth', authLimiter);

// Rate limiting for booking form
const bookingLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Лимит заявок превышен' });
app.use('/api/bookings', bookingLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

startCronJobs();

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
