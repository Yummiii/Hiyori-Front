FROM node:19
COPY . /app
WORKDIR /app

RUN yarn install --frozen-lockfile --production=false
RUN yarn build
EXPOSE 3000
ENTRYPOINT ["yarn", "start"]