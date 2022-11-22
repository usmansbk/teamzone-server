import { Team } from "@prisma/client";
import { AppContext } from "src/types";

export default {
  Query: {
    async getTeamById(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ): Promise<Team> {
      const { prismaClient, currentUser } = context;

      return prismaClient.team.findFirstOrThrow({
        where: {
          id,
          OR: [
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                },
              },
            },
            {
              owner: {
                id: currentUser!.id,
              },
            },
          ],
        },
      });
    },
  },
};
