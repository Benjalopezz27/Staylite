import path from 'path';
const { parse } = require('pg-connection-string');

export default ({ env }) => {
  const rawClient = env('DATABASE_CLIENT', 'sqlite').toLowerCase();
  const isPostgres = rawClient === 'postgres' || rawClient === 'postgresql';

  if (isPostgres) {
    const databaseUrl = env('DATABASE_URL');
    
    const config = {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', true) ? {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        } : false,
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10)
      },
    };

    if (databaseUrl) {
      const parsedConfig = parse(databaseUrl);
      Object.assign(config.connection, {
        host: parsedConfig.host || config.connection.host,
        port: parsedConfig.port || config.connection.port,
        database: parsedConfig.database || config.connection.database,
        user: parsedConfig.user || config.connection.user,
        password: parsedConfig.password || config.connection.password,
      });
    }

    return { connection: config };
  }

  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };
};