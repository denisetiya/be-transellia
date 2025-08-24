import express,{ type Application } from 'express';
import env from './config/env.config';
const app: Application = express()





app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});

