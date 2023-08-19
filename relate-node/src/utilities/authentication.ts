import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import jwksClient from 'jwks-rsa';

import { AUDIENCE, JWT_SECRET, REFRESH_TOKEN_SECRET } from '../config/env';

interface JwtHeader {
  kid: string;
}

interface JwtTokenSchema {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string; // This value is the unique identifier for the user.
  nonce: string;
  c_hash: string;
  email: string;
  email_verified: string;
  is_private_email: string;
  auth_time: number;
}

// 1 day = 86400 seconds
export const getToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: 86400,
  });
};

// 10 years = 315360000 seconds
export const getRefreshToken = (id: string): string => {
  return jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
    expiresIn: 315360000,
  });
};

export const verifyAppleToken = async (
  token: string
): Promise<JwtTokenSchema> => {
  const jwtHeader: JwtHeader = jwtDecode(token, { header: true });
  const appleResponse = await axios.get('https://appleid.apple.com/auth/keys');
  const { keys } = appleResponse.data;
  const sharedKid = keys.filter((k: JwtHeader) => k.kid === jwtHeader.kid)
    .length
    ? jwtHeader.kid
    : null;
  const client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
  });
  const key = await client.getSigningKey(sharedKid);
  const signingKey = key.getPublicKey();
  const result: JwtTokenSchema = <JwtTokenSchema>jwt.verify(token, signingKey);
  if (result.iss !== 'https://appleid.apple.com') {
    throw new Error('Issuers does not match.');
  }
  if (result.aud !== AUDIENCE) {
    throw new Error('Audiences do not match.');
  }
  return result;
};
