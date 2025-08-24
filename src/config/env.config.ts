import dotenv from 'dotenv';
dotenv.config();

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
      JWT_SECRET: process.env.JWT_SECRET as string,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID as string,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL as string,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY as string,
    };
 } else {
    env = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT_DEV ? Number(process.env.PORT_DEV) : 3000,
      JWT_SECRET: process.env.JWT_SECRET_DEV as string,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID_DEV as string,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL_DEV as string,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY_DEV as string,
    };
 }

 export default env;