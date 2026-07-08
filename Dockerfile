# syntax=docker/dockerfile:1

ARG NODE_VERSION=20-alpine

# ---- deps: install dependencies only, cached separately from source changes
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: hot-reload development server. Source is bind-mounted at
# runtime by docker-compose.dev.yml, not copied in here.
FROM deps AS dev
WORKDIR /app
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- builder: build the Next.js app
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ALLOW_INDEXING
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_ALLOW_INDEXING=${NEXT_PUBLIC_ALLOW_INDEXING}
RUN npm run build

# ---- runner: minimal production image, only the standalone server output
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
