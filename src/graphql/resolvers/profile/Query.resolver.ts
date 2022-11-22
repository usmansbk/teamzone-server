import { AppContext } from "src/types";

export default {
  Query: {
    getProfileById(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient } = context;

      return prismaClient.profile.findUniqueOrThrow({
        where: {
          id,
        },
      });
    },
  },
};
