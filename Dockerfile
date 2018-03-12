FROM node:6.13.1

ADD . /chat-server
WORKDIR /chat-server

RUN npm install

ARG SERVER_URL
ENV SERVER_URL=$SERVER_URL

EXPOSE 3000

RUN npm run build

RUN npm install -g serve

CMD npm run start:production