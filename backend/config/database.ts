import path from 'path';
import { parse } from 'pg-connection-string';

export default ({ env }) => {
  // --- RADAR DE DIAGNÓSTICO ---
  const dbUrl = env('DATABASE_URL');
  const client = env('DATABASE_CLIENT', 'sqlite').toLowerCase();

  console.log("\n⚠️ ======================================== ⚠️");
  console.log("¡STRAPI ESTÁ LEYENDO DATABASE.TS (COMPILADO)!");
  console.log("CLIENTE SOLICITADO:", client);
  console.log("¿HAY DATABASE_URL?:", !!dbUrl);
  console.log("⚠️ ======================================== ⚠️\n");

  if (client === 'postgres') {
    const config = dbUrl ? parse(dbUrl) : ({} as any);

    return {
      connection: {
        client: 'postgres',
        connection: {
          host: config.host || env('DATABASE_HOST', '127.0.0.1'),
          port: config.port ? Number(config.port) : env.int('DATABASE_PORT', 5432),
          database: config.database || env('DATABASE_NAME', 'strapi'),
          user: config.user || env('DATABASE_USERNAME', 'strapi'),
          password: config.password || env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: false } : false,
        },
        pool: { min: 2, max: 10 },
      },
    };
  }

  // Fallback a SQLite
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', '..', '.tmp/data.db'),
      },
      useNullAsDefault: true,
    },
  };
};