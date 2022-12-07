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

FROM node:14.17 as prod
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY --from=builder /app/dist ./dist
COPY ./prisma ./prisma
COPY ./locales ./locales
COPY .env.vault ./
EXPOSE 4000
CMD yarn start