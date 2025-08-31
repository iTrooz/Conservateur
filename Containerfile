FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./
CMD ["npm", "run", "start"]
