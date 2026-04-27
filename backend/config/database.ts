import path from 'path';

export default ({ env }) => {
  // 1. Forzamos a minúsculas. Si en Railway escribiste "Postgres" o "POSTGRES", esto evitará que falle.
  const client = env('DATABASE_CLIENT', 'sqlite').toLowerCase();

  console.log("---> Arrancando base de datos con cliente:", client);

  if (client === 'postgres') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          connectionString: env('DATABASE_URL'),
          // 2. Activamos SSL automáticamente para la nube, permitiendo los certificados de Railway
          ssl: env.bool('DATABASE_SSL', true) ? {
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
          } : false,
        },
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10)
        },
      },
    };
  }

  // 3. Fallback a SQLite para tu entorno local de desarrollo
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