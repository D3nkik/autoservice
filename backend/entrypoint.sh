#!/bin/sh
set -e

echo "[startup] Running prisma db push..."
node_modules/.bin/prisma db push --accept-data-loss --skip-generate
echo "[startup] DB sync complete, starting server..."
exec node dist/index.js
