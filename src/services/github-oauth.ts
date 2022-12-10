import fetch from "node-fetch";
import { MISSING_NAME_AND_EMAIL } from "src/constants/responseCodes";
import { UserPayload } from "src/types";
import AuthenticationError from "src/utils/errors/AuthenticationError";

const getUser = async (accessToken: string) => {
  const response = await fetch(`https://api.github.com/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

export default async function verifyGithubCode(
  code: string
): Promise<UserPayload> {
  const endpoint = `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  const tokenResponse = await response.json();

  if (tokenResponse.error) {
    throw new AuthenticationError(
      tokenResponse.error_description || tokenResponse.error
    );
  }

  const { access_token: accessToken } = tokenResponse as {
    access_token: string;
  };

  const payload = await getUser(accessToken);

  if (payload.message) {
    throw new AuthenticationError(payload.message);
  }

  const ticket = payload as {
    avatar_url?: string;
    email: string;
    name: string;
  };

  if (!(ticket.email && ticket.name)) {
    throw new AuthenticationError(MISSING_NAME_AND_EMAIL);
  }
  const [firstName, lastName] = ticket.name.split(" ");

  return {
    email: payload.email,
    pictureUrl: payload.avatar_url,
    firstName: firstName || "GitHub",
    lastName: lastName || "User",
    emailVerified: true,
  };
}
