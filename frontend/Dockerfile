FROM node:24-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

FROM base AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir .next \
    && chown node:node .next

USER node
EXPOSE 3000
CMD ["yarn", "dev"]

FROM base AS build_prod
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_BASE_URL=https://caviardeul.fr
ARG NEXT_PUBLIC_VERSION
RUN yarn build

FROM base AS prod
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup -g 65332 -S nextjs \
    && adduser -S nextjs -u 65332

COPY --from=build_prod /app/public ./public
COPY --from=build_prod --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build_prod --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
