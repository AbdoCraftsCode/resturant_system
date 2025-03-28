FROM node:22.14.0-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

RUN npm ci

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]