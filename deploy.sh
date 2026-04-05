#!/bin/bash
set -e
echo "=== АвтоСервис Deploy Script ==="

BASE_DIR="$HOME/autoservice"
cd "$BASE_DIR"

echo "--- [1/6] Installing backend dependencies ---"
cd backend
npm install --production=false
echo "--- [2/6] Generating Prisma client ---"
npx prisma generate
echo "--- [3/6] Running DB migrations ---"
npx prisma migrate deploy
echo "--- [4/6] Seeding database ---"
npx ts-node prisma/seed.ts || echo "Seed skipped (already done)"
echo "--- [5/6] Building backend ---"
npm run build
cd ..

echo "--- [6/7] Installing frontend dependencies ---"
cd frontend
npm install
echo "--- [7/7] Building frontend ---"
npm run build
cd ..

echo "--- Starting with PM2 ---"
# Local PM2 (installed in root node_modules)
./node_modules/.bin/pm2 delete autoservice-backend autoservice-frontend 2>/dev/null || true
./node_modules/.bin/pm2 start ecosystem.config.js
./node_modules/.bin/pm2 save

echo ""
echo "✅ Done!"
echo "   Backend:  http://77.222.40.251:4000/api/health"
echo "   Frontend: http://77.222.40.251:3001"
