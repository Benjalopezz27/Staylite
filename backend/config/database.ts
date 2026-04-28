import path from 'path';
import { parse } from 'pg-connection-string';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', '.tmp/data.db'),
      },
      useNullAsDefault: true,
    },
  };

  if (client === 'postgres') {
    const databaseUrl = env('DATABASE_URL');

    const config = (databaseUrl ? parse(databaseUrl) : {}) as any;

    connections['postgres'] = {
      connection: {
        host: config.host || env('DATABASE_HOST', '127.0.0.1'),
        port: config.port || env.int('DATABASE_PORT', 5432),
        database: config.database || env('DATABASE_NAME', 'strapi'),
        user: config.user || env('DATABASE_USERNAME', 'strapi'),
        password: config.password || env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: false } : false,
      },
      pool: {
        min: 0,
        max: 5,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
    };
  }

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};