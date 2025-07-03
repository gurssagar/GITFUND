FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

CMD ["node", "src/stdio/dist/server.mjs"]