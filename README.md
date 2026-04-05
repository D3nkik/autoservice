# АвтоСервис — Система управления

## Быстрый старт

### 1. База данных (PostgreSQL)
```bash
docker-compose up postgres -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # заполнить DATABASE_URL и JWT_SECRET
npm install
npm run prisma:migrate
npm run prisma:seed    # создаст 4 подъёмника, admin@autoservice.ru / admin123, услуги
npm run dev            # :4000
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev            # :3000
```

### 4. Тесты (Playwright)
```bash
cd tests
npm install
npx playwright install
npm test
```

## Структура проекта
```
autoservice/
├── frontend/           # Next.js (React) — порт 3000
│   └── src/
│       ├── pages/      # Роуты: /, /services, /booking, /contacts
│       │   ├── auth/   # /auth/login, /register, /forgot-password
│       │   ├── cabinet/# /cabinet — личный кабинет
│       │   └── admin/  # /admin — панель администратора
│       ├── components/ # layout/Header, Footer; booking/BookingForm
│       └── lib/        # api.ts, auth.ts, utils.ts
│
├── backend/            # Express + Prisma — порт 4000
│   ├── src/
│   │   ├── routes/     # auth, services, slots, bookings, me, admin/*
│   │   ├── middleware/ # auth.ts, validate.ts
│   │   └── services/   # prisma.ts, email.ts, cron.ts
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
│
├── tests/              # Playwright e2e-тесты
│   └── e2e/            # homepage, booking, auth, services, admin
│
└── docker-compose.yml  # postgres + backend + frontend
```

## Учётные данные по умолчанию (после seed)
- Admin: `admin@autoservice.ru` / `admin123`
