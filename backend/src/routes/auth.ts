import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { sendEmail } from '../services/email';
import crypto from 'crypto';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function generateTokens(userId: number, role: string) {
  const access_token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  } as jwt.SignOptions);
  const refresh_token = jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  } as jwt.SignOptions);
  return { access_token, refresh_token };
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Ошибка валидации', errors: parsed.error.errors });

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email уже зарегистрирован' });

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, phone, password_hash } });

  // Link guest bookings by email or phone
  await prisma.booking.updateMany({
    where: { user_id: null, OR: [{ client_email: email }, { client_phone: phone }] },
    data: { user_id: user.id },
  });

  const tokens = generateTokens(user.id, user.role);
  const { password_hash: _, ...safeUser } = user;
  return res.status(201).json({ ...tokens, user: safeUser });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Ошибка валидации' });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Неверный email или пароль' });

  // Link guest bookings by email or phone on login
  await prisma.booking.updateMany({
    where: { user_id: null, OR: [{ client_email: email }, { client_phone: user.phone }] },
    data: { user_id: user.id },
  });

  const tokens = generateTokens(user.id, user.role);
  const { password_hash: _, ...safeUser } = user;
  return res.json({ ...tokens, user: safeUser });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(401).json({ message: 'Refresh token не предоставлен' });

  try {
    const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as { id: number; role: string };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
    const tokens = generateTokens(user.id, user.role);
    return res.json(tokens);
  } catch {
    return res.status(401).json({ message: 'Refresh token недействителен' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) return res.json({ message: 'Если email существует, письмо отправлено' });

  const token = crypto.randomBytes(32).toString('hex');
  // In production, store token with expiry in DB; here we sign it
  const resetToken = jwt.sign({ id: user.id, token }, process.env.JWT_SECRET!, { expiresIn: '1h' } as jwt.SignOptions);
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Сброс пароля — АвтоСервис',
    html: `<p>Для сброса пароля перейдите по ссылке: <a href="${resetUrl}">${resetUrl}</a></p><p>Ссылка действительна 1 час.</p>`,
  });

  return res.json({ message: 'Письмо отправлено' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Токен и пароль обязательны' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: payload.id }, data: { password_hash: hash } });
    return res.json({ message: 'Пароль изменён' });
  } catch {
    return res.status(400).json({ message: 'Токен недействителен или истёк' });
  }
});

export default router;
