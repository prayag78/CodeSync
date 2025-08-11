# Base image for Node.js
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app

# Add build arguments for environment variables
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG DATABASE_URL



# Set environment variables for build
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy the standalone directory and its contents
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
