FROM node:16.13.1-alpine3.14

ENV NODE_ENV production
ENV SERVICE_NAME template-service

WORKDIR /app

COPY ./package*.json ./

RUN npm install --only=prod

COPY . .


USER node
EXPOSE 4200
# NOTE enables graceful shutdown > https://medium.com/@gchudnov/trapping-signals-in-docker-containers-7a57fdda7d86
ENTRYPOINT ["node"] 
CMD ["src/index.js"]

# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
