FROM node:22-alpine
RUN npm install -g yarn

WORKDIR /app

COPY package.json tsconfig.json yarn.lock .env ./
RUN yarn install --frozen-lockfile

COPY src ./src

RUN yarn build 

CMD [ "node", "dist/main.js" ]