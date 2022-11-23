import { OAuth2Client } from "google-auth-library";
import { JsonWebTokenError } from "jsonwebtoken";
import { INVALID_TOKEN_ERROR } from "src/constants/errors";

export default async function verifyGoogleIdToken(idToken: string) {
  const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });

  const ticket = await client.verifyIdToken({
    idToken,
  });

  const payload = ticket.getPayload();

  if (!payload || !(payload.email && payload.given_name)) {
    throw new JsonWebTokenError(INVALID_TOKEN_ERROR);
  }

  return {
    firstName: payload.given_name,
    lastName: payload.family_name || payload.given_name,
    email: payload.email,
    locale: payload.locale,
    emailVerified: !!payload.email_verified,
    pictureUrl: payload.picture,
  };
}
