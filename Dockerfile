FROM node:16.17.0-bullseye-slim AS build-deps

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm install

COPY . /usr/src/app/

EXPOSE 3001

CMD ["node", "server.js"]
