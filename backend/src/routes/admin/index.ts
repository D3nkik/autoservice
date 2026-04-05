import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import bookingsRouter from './bookings';
import clientsRouter from './clients';
import servicesRouter from './services';
import scheduleRouter from './schedule';
import dashboardRouter from './dashboard';
import historyRouter from './history';

const router = Router();
router.use(authenticate, requireAdmin);

router.use('/dashboard', dashboardRouter);
router.use('/bookings', bookingsRouter);
router.use('/clients', clientsRouter);
router.use('/services', servicesRouter);
router.use('/schedule', scheduleRouter);
router.use('/history', historyRouter);

export default router;
