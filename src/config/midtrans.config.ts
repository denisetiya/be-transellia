import midtransClient from 'midtrans-client';
import env from './env.config';

const midtransApi = new midtransClient.CoreApi({
  isProduction: env.NODE_ENV === 'production',
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY
});

export default midtransApi;
