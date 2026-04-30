"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
exports.default = ({ env }) => {
    // Verificamos en qué entorno estamos
    const isProduction = env('NODE_ENV') === 'production';
    // ==========================================
    // CONFIGURACIÓN DE PRODUCCIÓN (RAILWAY)
    // ==========================================
    if (isProduction) {
        const dbUrl = env('DATABASE_URL');
        if (!dbUrl) {
            console.error("🚨 FATAL ERROR: ¡Railway no inyectó DATABASE_URL! 🚨");
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
    // ==========================================
    // CONFIGURACIÓN LOCAL (DESARROLLO)
    // ==========================================
    console.log("💻 MODO LOCAL DETECTADO: Usando SQLite");
    return {
        connection: {
            client: 'sqlite',
            connection: {
                filename: path_1.default.join(__dirname, '..', '..', '.tmp/data.db'),
            },
            useNullAsDefault: true,
        },
    };
};
