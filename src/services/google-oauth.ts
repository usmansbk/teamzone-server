import { OAuth2Client } from "google-auth-library";
import { JsonWebTokenError } from "jsonwebtoken";
import { INVALID_TOKEN_ERROR } from "src/constants/errors";
import { UserPayload } from "src/types";

export default async function verifyGoogleCode(
  code: string
): Promise<UserPayload> {
  const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "postmessage",
  });

  try {
    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("No Google payload");
    }

    return {
      firstName: payload.given_name!,
      lastName: payload.family_name!,
      email: payload.email!,
      locale: payload.locale,
      emailVerified: !!payload.email_verified,
      pictureUrl: payload.picture,
    };
  } catch (e) {
    throw new JsonWebTokenError(INVALID_TOKEN_ERROR);
  }
}
