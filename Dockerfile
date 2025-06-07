# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies into a temporary directory to cache them
FROM base AS deps
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy dependencies and project files
FROM base AS builder
COPY --from=deps /temp/dev/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true

# Build the project
RUN bun run build

# Create the production image
FROM base AS runner
WORKDIR /usr/src/app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /temp/prod/node_modules ./node_modules

# Copy necessary files and set permissions
COPY --from=builder /usr/src/app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy build output
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static

USER nextjs

# Set port and hostname environment variable
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose the port
EXPOSE $PORT

# Start the server
CMD ["bun", "run", "server.js"]
