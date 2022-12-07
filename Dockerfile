# syntax=docker/dockerfile:1
FROM node:14.17 as base 
ENV NODE_ENV=development
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .

FROM base as dev 
CMD yarn dev 

FROM base as builder
RUN yarn build

FROM base as prod
ENV NODE_ENV=production
WORKDIR /usr/app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY ./locales ./locales
COPY package.json yarn.lock ./
COPY .env.vault ./
RUN yarn
EXPOSE 4000
CMD yarn start