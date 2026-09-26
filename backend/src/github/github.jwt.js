import jwt from 'jsonwebtoken';
import fs from 'fs';
import ENV from '../config/env.js';

const generateJWT = () => {
  const privateKey = fs.readFileSync(ENV.GITHUB.PRIVATE_KEY_PATH, "utf8");

  const now = Math.floor(Date.now() / 1000);
  const iat = now - 60; // 60 seconds in past to allow for clock drift
  const exp = iat + (5 * 60); // 5 minutes total lifespan

  return jwt.sign(
    {
      iat,
      exp,
      iss: ENV.GITHUB.APP_ID,
    },
    privateKey,
    { algorithm: 'RS256' }
  );
};

export default generateJWT;