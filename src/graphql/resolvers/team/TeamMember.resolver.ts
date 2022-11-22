import { Team, TeamMember, User } from "@prisma/client";
import { AppContext } from "src/types";

export default {
  TeamMember: {
    team(
      teamMember: TeamMember,
      args: never,
      context: AppContext
    ): Promise<Team | null> {
      const { prismaClient } = context;

      return prismaClient.teamMember
        .findUnique({
          where: {
            id: teamMember.id,
          },
        })
        .team();
    },
    member(
      teamMember: TeamMember,
      args: never,
      context: AppContext
    ): Promise<User | null> {
      const { prismaClient } = context;

      return prismaClient.teamMember
        .findUnique({
          where: {
            id: teamMember.id,
          },
        })
        .member();
    },
    isMe(teamMember: TeamMember, args: never, context: AppContext): boolean {
      return teamMember.memberId === context.currentUser?.id;
    },
  },
};
