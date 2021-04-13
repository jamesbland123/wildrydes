FROM node:15.14.0-alpine3.13

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY app/ .
COPY public/ public/

EXPOSE 8080

ENTRYPOINT ["node", "index.js"]