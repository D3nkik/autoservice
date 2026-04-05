import { Router, Request, Response } from 'express';
import { prisma } from '../../services/prisma';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const services = await prisma.service.findMany({ orderBy: { sort_order: 'asc' } });
  return res.json(services);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, description, price_from, price_to, duration_hours, is_active, sort_order } = req.body;
  const service = await prisma.service.create({
    data: { name, description, price_from, price_to: price_to || null, duration_hours: duration_hours || 1, is_active: is_active ?? true, sort_order: sort_order || 0 },
  });
  return res.status(201).json(service);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { name, description, price_from, price_to, duration_hours, is_active, sort_order } = req.body;
  const service = await prisma.service.update({
    where: { id: parseInt(req.params.id) },
    data: { name, description, price_from, price_to: price_to || null, duration_hours, is_active, sort_order },
  });
  return res.json(service);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.service.update({ where: { id: parseInt(req.params.id) }, data: { is_active: false } });
  return res.json({ message: 'Услуга деактивирована' });
});

export default router;
