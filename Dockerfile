FROM node:lts-alpine

WORKDIR /usr/src/app/

COPY package*.json /usr/src/app/

RUN npm install

COPY . .

EXPOSE 3500

CMD ["npm", "run", "dev"]