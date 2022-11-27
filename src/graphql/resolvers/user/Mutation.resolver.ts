import verifyGithubCode from "src/services/github-oauth";
import verifyGoogleCode from "src/services/google-oauth";
import { AppContext, SocialProvider, UserPayload } from "src/types";
import AuthenticationError from "src/utils/errors/AuthenticationError";
import { INVALID_SOCIAL_PROVIDER } from "src/constants/responseCodes";

export default {
  Mutation: {
    loginWithSocialProvider: async (
      _parent: unknown,
      { code, provider }: { code: string; provider: SocialProvider },
      context: AppContext
    ) => {
      const { prismaClient, jwt, t } = context;

      let payload: UserPayload;

      if (provider === "GOOGLE") {
        payload = await verifyGoogleCode(code);
      } else if (provider === "GITHUB") {
        payload = await verifyGithubCode(code);
      } else {
        throw new AuthenticationError(t(INVALID_SOCIAL_PROVIDER));
      }

      let user = await prismaClient.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        const {
          email,
          firstName,
          lastName,
          locale,
          emailVerified,
          pictureUrl,
        } = payload;

        user = await prismaClient.user.create({
          data: {
            email,
            emailVerified,
            locale,
            firstName,
            lastName,
            pictureUrl,
          },
        });
      }

      return {
        token: jwt.sign({ id: user.id }),
      };
    },
    updateCurrentUserFullName(
      parent: unknown,
      { firstName, lastName }: { firstName: string; lastName: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      return prismaClient.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          firstName,
          lastName,
        },
      });
    },
    updateCurrentUserTimeZone(
      parent: unknown,
      { timezone }: { timezone: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      return prismaClient.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          timezone,
        },
      });
    },
    updateCurrentUserCountry(
      parent: unknown,
      { countryCode }: { countryCode: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      return prismaClient.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          countryCode,
        },
      });
    },
    updateCurrentUserLocale(
      parent: unknown,
      { locale }: { locale: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      return prismaClient.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          locale,
        },
      });
    },
  },
};
