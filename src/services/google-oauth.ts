import { OAuth2Client } from "google-auth-library";
import { INVALID_TOKEN_ERROR } from "src/constants/errors";
import { MISSING_NAME_AND_EMAIL } from "src/constants/responseCodes";
import { UserPayload } from "src/types";
import AuthenticationError from "src/utils/errors/AuthenticationError";

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

    if (!(payload?.given_name && payload?.email)) {
      throw new AuthenticationError(MISSING_NAME_AND_EMAIL);
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
    throw new AuthenticationError(INVALID_TOKEN_ERROR, e as Error);
  }
}
