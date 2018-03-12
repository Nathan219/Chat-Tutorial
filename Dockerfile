FROM node:6.13.1

ADD . /chat-server
WORKDIR /chat-server

RUN npm install

ARG SERVER_URL
EXPOSE 3000

RUN npm build

CMD npm start