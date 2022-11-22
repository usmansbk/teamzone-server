import verifyGoogleIdToken from "src/services/google-oauth";
import { AppContext } from "src/types";

export default {
  Mutation: {
    loginWithGoogle: async (
      _parent: unknown,
      { idToken }: { idToken: string },
      context: AppContext
    ) => {
      const { prismaClient, jwt } = context;

      const payload = await verifyGoogleIdToken(idToken);

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
