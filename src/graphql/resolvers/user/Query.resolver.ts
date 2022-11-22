import { AppContext } from "src/types";

export default {
  Query: {
    me: (parent: unknown, args: never, context: AppContext) => {
      const { prismaClient, currentUser } = context;

      return prismaClient.user.findUnique({
        where: {
          id: currentUser?.id,
        },
      });
    },
  },
};
