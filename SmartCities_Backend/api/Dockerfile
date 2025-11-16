FROM node:22-alpine

# Install wget for healthchecks
RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY test ./test
COPY config.json ./

EXPOSE 3000

CMD ["node", "src/index.js"]