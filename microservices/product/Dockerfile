FROM node:22-alpine

WORKDIR /app/product

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8002

CMD ["npm", "run", "start"]