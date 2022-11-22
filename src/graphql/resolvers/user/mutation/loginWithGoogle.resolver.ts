import verifyGoogleIdToken from "src/services/google-oauth";
import { AppContext } from "src/types";

export default {
  Mutation: {
    loginWithGoogle: async (
      _parent: unknown,
      { idToken }: { idToken: string },
      context: AppContext
    ) => {
      const { prismaClient } = context;

      const { email, firstName, lastName, locale, emailVerified, pictureUrl } =
        await verifyGoogleIdToken(idToken);

      let user = await prismaClient.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        user = await prismaClient.user.create({
          data: {
            email,
            emailVerified,
            profile: {
              create: {
                firstName,
                lastName,
                locale,
                pictureUrl,
              },
            },
          },
        });
      }

      return {
        token: "hello",
      };
    },
  },
};
