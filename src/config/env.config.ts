import dotenv from 'dotenv';
dotenv.config();

// Validation function for required environment variables
function validateEnvVar(varName: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Environment variable ${varName} is required but not defined`);
  }
  return value;
}

 
let env : {
  NODE_ENV: string;
  SALT : string;
  PORT: number;
  API_KEY: string;
  JWT_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  MIDTRANS_SERVER_KEY : string;
  MIDTRANS_CLIENT_KEY :  string;
  CORS_ORIGINS: string;
};

if (process.env.NODE_ENV === 'production') {
    env = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
      API_KEY: validateEnvVar('API_KEY', process.env.API_KEY),
      SALT: validateEnvVar('SALT', process.env.SALT),
      JWT_SECRET: validateEnvVar('JWT_SECRET', process.env.JWT_SECRET),
      FIREBASE_PROJECT_ID: validateEnvVar('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID),
      FIREBASE_CLIENT_EMAIL: validateEnvVar('FIREBASE_CLIENT_EMAIL', process.env.FIREBASE_CLIENT_EMAIL),
      FIREBASE_PRIVATE_KEY: validateEnvVar('FIREBASE_PRIVATE_KEY', process.env.FIREBASE_PRIVATE_KEY),
      MIDTRANS_SERVER_KEY : validateEnvVar('MIDTRANS_SERVER_KEY', process.env.MIDTRANS_SERVER_KEY),
      MIDTRANS_CLIENT_KEY :  validateEnvVar('MIDTRANS_CLIENT_KEY', process.env.MIDTRANS_CLIENT_KEY),
      CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000,https://admin-transellia.vercel.app",
    };
 } else {
    env = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT_DEV ? Number(process.env.PORT_DEV) : 3000,
      SALT: validateEnvVar('SALT_DEV', process.env.SALT_DEV),
      API_KEY: validateEnvVar('API_KEY_DEV', process.env.API_KEY_DEV),
      JWT_SECRET: validateEnvVar('JWT_SECRET_DEV', process.env.JWT_SECRET_DEV),
      FIREBASE_PROJECT_ID: validateEnvVar('FIREBASE_PROJECT_ID_DEV', process.env.FIREBASE_PROJECT_ID_DEV),
      FIREBASE_CLIENT_EMAIL: validateEnvVar('FIREBASE_CLIENT_EMAIL_DEV', process.env.FIREBASE_CLIENT_EMAIL_DEV),
      FIREBASE_PRIVATE_KEY: validateEnvVar('FIREBASE_PRIVATE_KEY_DEV', process.env.FIREBASE_PRIVATE_KEY_DEV),
      MIDTRANS_SERVER_KEY : validateEnvVar('MIDTRANS_SERVER_KEY_DEV', process.env.MIDTRANS_SERVER_KEY_DEV),
      MIDTRANS_CLIENT_KEY :  validateEnvVar('MIDTRANS_CLIENT_KEY_DEV', process.env.MIDTRANS_CLIENT_KEY_DEV),
      CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000,https://admin-transellia.vercel.app",
    };
 }

 export default env;