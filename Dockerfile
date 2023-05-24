FROM node:14-alpine as builder
ENV NODE_ENV=build
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production

FROM node:14-alpine
  ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules/ ./node_modules/
COPY --from=builder /usr/src/app/dist/ ./dist/

EXPOSE 8080

CMD ["node", "dist/main"]