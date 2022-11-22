import { Team, TeamMember, User } from "@prisma/client";
import { AppContext } from "src/types";

export default {
  Team: {
    teammates(
      team: Team,
      args: never,
      context: AppContext
    ): Promise<TeamMember[] | null> {
      const { prismaClient } = context;

      return prismaClient.team
        .findUnique({
          where: {
            id: team.id,
          },
        })
        .teammates();
    },
    owner(team: Team, args: never, context: AppContext): Promise<User | null> {
      const { prismaClient } = context;

      return prismaClient.team
        .findUnique({
          where: {
            id: team.id,
          },
        })
        .owner();
    },
    isOwner(team: Team, args: never, context: AppContext) {
      return team.ownerId === context.currentUser?.id;
    },
  },
};
