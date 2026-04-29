import path from 'path';
import { parse } from 'pg-connection-string';

export default ({ env }) => {
  // Railway (and most cloud providers) inject DATABASE_URL automatically.
  // If it is present we always use postgres, regardless of DATABASE_CLIENT.
  const databaseUrl = env('DATABASE_URL', null);
  const client = databaseUrl ? 'postgres' : env('DATABASE_CLIENT', 'sqlite');

  if (client === 'postgres') {
    const config = (databaseUrl ? parse(databaseUrl) : {}) as any;

    return {
      connection: {
        client: 'postgres',
        connection: {
          host: config.host || env('DATABASE_HOST', '127.0.0.1'),
          port: Number(config.port) || env.int('DATABASE_PORT', 5432),
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
        acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
      },
    };
  }

  // Fallback: SQLite for local development without DATABASE_URL
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', '..', '.tmp/data.db'),
      },
      useNullAsDefault: true,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};