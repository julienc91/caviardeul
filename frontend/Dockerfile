# Keep both on the same alpine release: the prod stage reuses the node binary
FROM node:26-alpine3.24 AS base
FROM alpine:3.24 AS runtime

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir .next \
    && chown node:node .next

USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS build_prod
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_BASE_URL=https://caviardeul.fr
ARG NEXT_PUBLIC_VERSION
RUN npm run build

# The standalone server only needs the node binary, not npm and its dependencies
FROM runtime AS prod
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache libatomic libstdc++ \
    && addgroup -g 65332 -S nextjs \
    && adduser -S nextjs -u 65332
COPY --from=base /usr/local/bin/node /usr/local/bin/node

COPY --from=build_prod /app/public ./public
COPY --from=build_prod --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build_prod --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
