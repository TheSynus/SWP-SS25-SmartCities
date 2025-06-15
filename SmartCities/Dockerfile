# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files and install deps first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build static files
RUN npm run build

# Production Stage
FROM nginx:alpine AS production

# Copy build output to Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose default port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
