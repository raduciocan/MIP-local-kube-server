# build stage
FROM node:lts-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# runtime
FROM node:lts-alpine
WORKDIR /app

RUN npm install -g serve@14.2.0
COPY --from=build /app/dist ./dist

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
