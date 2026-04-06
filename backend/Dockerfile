FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
EXPOSE 4000
CMD ["./entrypoint.sh"]
