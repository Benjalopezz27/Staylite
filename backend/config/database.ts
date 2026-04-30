export default ({ env }) => {
  const dbUrl = env('DATABASE_URL');

  // Un log gigante en rojo si Railway no inyectó la variable
  if (!dbUrl) {
    console.error("🚨 FATAL ERROR: ¡Railway no inyectó DATABASE_URL! 🚨");
  } else {
    console.log("✅ BASE DE DATOS DETECTADA CORRECTAMENTE EN LA NUBE");
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        connectionString: dbUrl,
        ssl: {
          rejectUnauthorized: false
        },
      },
      pool: { min: 2, max: 10 },
    },
  };
}