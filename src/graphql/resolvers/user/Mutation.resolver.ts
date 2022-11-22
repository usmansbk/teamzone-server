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
  },
};
