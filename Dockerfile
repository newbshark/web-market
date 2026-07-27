FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 

RUN npm install -g pnpm

RUN pnpm ci

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]