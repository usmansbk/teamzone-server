import fetch from "node-fetch";
import { INVALID_TOKEN_ERROR } from "src/constants/errors";
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

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
    const { access_token: accessToken } = (await response.json()) as {
      access_token: string;
    };
    const payload = (await getUser(accessToken)) as {
      avatar_url?: string;
      email: string;
      name: string;
    };
    const [firstName, lastName] = payload.name.split(" ");

    return {
      email: payload.email,
      pictureUrl: payload.avatar_url,
      firstName,
      lastName,
      emailVerified: true,
    };
  } catch (e) {
    throw new AuthenticationError(INVALID_TOKEN_ERROR, e as Error);
  }
}
