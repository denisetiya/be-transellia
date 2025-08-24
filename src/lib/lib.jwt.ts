// utils/jwt.js
import crypto from 'crypto';

class Jwt {

  static sign(payload: Record<string, unknown>, secret: string, options: { expiresIn?: number } = {}) {
    // Header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    // Tambahkan exp jika ada expiresIn
    const finalPayload = { ...payload };
    if (options.expiresIn) {
      const now = Math.floor(Date.now() / 1000);
      finalPayload.exp = now + options.expiresIn;
    }

    // Encode header dan payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(finalPayload));

    // Buat signature
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }


  static verify(token: string, secret: string) {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');

      // Verifikasi signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode payload
      if (!encodedPayload) {
        throw new Error('Invalid token: payload missing');
      }
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));

      // Cek expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof Error) {
        console.error('JWT verification failed:', error.message);
      } else {
        console.error('JWT verification failed:', error);
      }
      return null;
    }
  }


  static decode(token: string) {
    try {
      const [, encodedPayload] = token.split('.');
      if (!encodedPayload) {
        throw new Error('Invalid token: payload missing');
      }
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
      return payload;
    } catch (error) {
      if (error instanceof Error) {
        console.error('JWT decode failed:', error.message);
      } else {
        console.error('JWT decode failed:', error);
      }
      return null;
    }
  }

  static base64UrlEncode(str: string) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static base64UrlDecode(str: string) {
    // Tambahkan padding jika perlu
    const padding = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
}

export default Jwt;