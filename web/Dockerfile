FROM node:24-alpine

WORKDIR /mehrsepehr/frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 80

CMD [ "npm", "run", "serve", "--", "--port", "80" ]