const { parse } = require('pg-connection-string');

module.exports = ({ env }) => {
  // --- RADAR DE DIAGNÓSTICO ---
  console.log("\n⚠️ ======================================== ⚠️");
  console.log("¡STRAPI ESTÁ LEYENDO EL ARCHIVO DATABASE.JS CORRECTO!");
  console.log("CLIENTE SOLICITADO:", env('DATABASE_CLIENT'));
  console.log("¿HAY DATABASE_URL?:", !!env('DATABASE_URL'));
  console.log("⚠️ ======================================== ⚠️\n");

  const isPostgres = env('DATABASE_CLIENT') === 'postgres' || !!env('DATABASE_URL');

  if (isPostgres) {
    const dbUrl = env('DATABASE_URL');
    const config = dbUrl ? parse(dbUrl) : {};

    return {
      connection: {
        client: 'postgres',
        connection: {
          host: config.host || env('DATABASE_HOST', '127.0.0.1'),
          port: config.port || env.int('DATABASE_PORT', 5432),
          database: config.database || env('DATABASE_NAME', 'strapi'),
          user: config.user || env('DATABASE_USERNAME', 'strapi'),
          password: config.password || env('DATABASE_PASSWORD', 'strapi'),
          // En Railway el SSL es obligatorio y debe ignorar certificados auto-firmados
          ssl: { rejectUnauthorized: false },
        },
        pool: { min: 2, max: 10 },
      },
    };
  }

  // Fallback a SQLite
  return {
    connection: {
      client: 'sqlite',
      connection: { filename: '.tmp/data.db' },
      useNullAsDefault: true,
    },
  };
};