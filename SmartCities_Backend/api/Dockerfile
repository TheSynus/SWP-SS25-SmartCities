FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
COPY config.json ./

# Ensure non-root execution
RUN addgroup -S app && adduser -S app -G app
USER app

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "src/index.js"]