FROM node:20-alpine AS builder

WORKDIR /app

# Install build deps for native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl && mkdir -p uploads

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000

ENV NODE_ENV=production
ENV OLLAMA_BASE_URL=http://ollama:11434

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -sf http://localhost:5000/health || exit 1

CMD ["node", "dist/app.js"]
