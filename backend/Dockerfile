FROM node:lts-alpine
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY src ./src

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/index.js"]
