FROM node:18.13-alpine3.16
WORKDIR /app
RUN npm config set registry https://registry.npm.taobao.org && \
    npm i -g pnpm
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm i --frozen-lockfile
COPY . .
RUN npm run build && \
    npm run build:pkg && \
    rm -rf node_modules src dist
EXPOSE 1234
CMD ["./deploy/ww-message-push-service"]
