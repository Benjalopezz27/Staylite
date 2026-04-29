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
ENV NODE_ENV=production

WORKDIR /opt/app

# AQUÍ ESTÁ LA MAGIA: Copiamos TODO el proyecto compilado, no solo pedazos sueltos.
COPY --from=build /opt/app ./

# Instalamos solo las dependencias de producción para limpiar el peso
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --only=production

ENV PATH /opt/app/node_modules/.bin:$PATH

RUN chown -R 1000:1000 /opt/app
USER 1000
EXPOSE 1337
CMD ["npm", "run", "start"]