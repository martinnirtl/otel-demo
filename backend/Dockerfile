FROM node:14.17-alpine3.12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=prod

COPY . .

ENV NODE_ENV production
ENV SERVICE_NAME backend

# NOTE enables graceful shutdown > https://medium.com/@gchudnov/trapping-signals-in-docker-containers-7a57fdda7d86
ENTRYPOINT ["node", "src/index.js"]

USER node

# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
