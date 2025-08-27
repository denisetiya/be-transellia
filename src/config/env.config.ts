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
  PORT: number;
  JWT_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
};

 if (process.env.NODE_ENV === 'production') {
    env = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
      JWT_SECRET: validateEnvVar('JWT_SECRET', process.env.JWT_SECRET),
      FIREBASE_PROJECT_ID: validateEnvVar('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID),
      FIREBASE_CLIENT_EMAIL: validateEnvVar('FIREBASE_CLIENT_EMAIL', process.env.FIREBASE_CLIENT_EMAIL),
      FIREBASE_PRIVATE_KEY: validateEnvVar('FIREBASE_PRIVATE_KEY', process.env.FIREBASE_PRIVATE_KEY),
    };
 } else {
    env = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT_DEV ? Number(process.env.PORT_DEV) : 3000,
      JWT_SECRET: validateEnvVar('JWT_SECRET_DEV', process.env.JWT_SECRET_DEV),
      FIREBASE_PROJECT_ID: validateEnvVar('FIREBASE_PROJECT_ID_DEV', process.env.FIREBASE_PROJECT_ID_DEV),
      FIREBASE_CLIENT_EMAIL: validateEnvVar('FIREBASE_CLIENT_EMAIL_DEV', process.env.FIREBASE_CLIENT_EMAIL_DEV),
      FIREBASE_PRIVATE_KEY: validateEnvVar('FIREBASE_PRIVATE_KEY_DEV', process.env.FIREBASE_PRIVATE_KEY_DEV),
    };
 }

 export default env;