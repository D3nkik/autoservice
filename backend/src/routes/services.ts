import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';

const router = Router();

// GET /api/services
router.get('/', async (_req: Request, res: Response) => {
  const services = await prisma.service.findMany({
    where: { is_active: true },
    orderBy: { sort_order: 'asc' },
  });
  return res.json(services);
});

// GET /api/services/:id
router.get('/:id', async (req: Request, res: Response) => {
  const service = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!service) return res.status(404).json({ message: 'Услуга не найдена' });
  return res.json(service);
});

export default router;
