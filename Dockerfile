# -- Build stage --
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# -- Production stage --
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY drive-key.json ./
COPY data/ ./data/

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/src/index.js"]
