FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
EXPOSE 5173
# node_modules lives in a named volume (see docker-compose.yml); reinstall if the lockfile changed.
CMD ["sh", "-c", "npm install --no-audit --no-fund && npm run dev -- --host 0.0.0.0 --port 5173"]
