# Build Stage
FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y build-essential gcc autoconf automake libvips-dev git

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Runtime Stage
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y libvips-dev && rm -rf /var/lib/apt/lists/*
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --only=production

COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/package.json ./package.json

ENV PATH /opt/app/node_modules/.bin:$PATH

RUN chown -R 1000:1000 /opt/app
USER 1000
EXPOSE 1337
CMD ["npm", "run", "start"]




