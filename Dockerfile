FROM node:8-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN apk add --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/ make gcc g++ python git bash tzdata vips-dev fftw-dev && \
  npm install --production && \
  rm -f .npmrc && \
  rm -rf ~/.npm && rm -rf ~/.node-gyp && \
  apk del gcc g++ git python make && \
  rm -rf /var/cache/apk/* && \
  rm -rf /usr/local/lib/node_modules/npm/doc/ && \
  rm -rf /usr/local/lib/node_modules/npm/html/ && \
  rm -rf /tmp/*

# Prepare entrypoint script
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Copy all necessary parts of the app
COPY lib/ lib/
COPY test/ test/
COPY *.js ./

# Set vars en run app
ENV TZ=Europe/Brussels
EXPOSE 8888
CMD ["node", "server.js" ]
ENTRYPOINT ["/app/entrypoint.sh"]
