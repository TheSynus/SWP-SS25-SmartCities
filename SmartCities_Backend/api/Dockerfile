FROM node:22-alpine

# Install wget for healthchecks
RUN apk add --no-cache wget

WORKDIR /app

COPY api/package*.json ./
RUN npm install

COPY api/src ./src
COPY api/config.json ./

# Copy testData to location accessible via ../../../testData from /app
COPY testData /testData

EXPOSE 3000

CMD ["node", "src/index.js"]