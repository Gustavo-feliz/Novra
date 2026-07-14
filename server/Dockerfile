FROM node:22-alpine
WORKDIR /app

# Only install production deps from root package.json
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only the server source
COPY server/ ./server/

EXPOSE 8787
CMD ["node", "server/index.mjs"]
