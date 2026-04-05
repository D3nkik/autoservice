#!/bin/bash
# Full setup script for autoservice on 24rasp.ru/auto
# Run once from ~/autoservice/
set -e

export HOME=/home/k/kalkov553
export PATH="$HOME/.npm/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

BASE="$HOME/autoservice"
LOG="$BASE/setup.log"

echo "=== AutoService Setup $(date) ===" | tee -a "$LOG"
cd "$BASE"

# ---- BACKEND ----
echo "--- [1/6] Prisma generate ---" | tee -a "$LOG"
cd backend
npx prisma generate 2>&1 | tee -a "$LOG"

echo "--- [2/6] Prisma migrate ---" | tee -a "$LOG"
npx prisma migrate dev --name init 2>&1 | tee -a "$LOG"

echo "--- [3/6] Seed database ---" | tee -a "$LOG"
npx ts-node prisma/seed.ts 2>&1 | tee -a "$LOG" || echo "Seed skipped (already seeded)" | tee -a "$LOG"

echo "--- [4/6] Build backend ---" | tee -a "$LOG"
npm run build 2>&1 | tee -a "$LOG"
cd "$BASE"

# ---- FRONTEND ----
echo "--- [5/6] Frontend install + build ---" | tee -a "$LOG"
cd frontend
npm install 2>&1 | tail -5 | tee -a "$LOG"
npm run build 2>&1 | tail -20 | tee -a "$LOG"
cd "$BASE"

# ---- PM2 ----
echo "--- [6/6] Start with PM2 ---" | tee -a "$LOG"
PM2="$BASE/node_modules/.bin/pm2"
$PM2 delete autoservice-backend  2>/dev/null || true
$PM2 delete autoservice-frontend 2>/dev/null || true
$PM2 start ecosystem.config.js 2>&1 | tee -a "$LOG"
$PM2 save 2>&1 | tee -a "$LOG"

echo "" | tee -a "$LOG"
echo "======================================" | tee -a "$LOG"
echo "✅ Setup complete!" | tee -a "$LOG"
echo "   API health: http://localhost:4000/api/health" | tee -a "$LOG"
echo "   Frontend:   http://localhost:3001/auto" | tee -a "$LOG"
echo "   Public URL: https://24rasp.ru/auto" | tee -a "$LOG"
echo "   Admin:      https://24rasp.ru/auto/admin" | tee -a "$LOG"
echo "   Login:      admin@autoservice.ru / admin123" | tee -a "$LOG"
echo "======================================" | tee -a "$LOG"
