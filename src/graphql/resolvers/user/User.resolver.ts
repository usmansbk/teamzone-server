import type { Team, TeamMember, User } from "@prisma/client";
import { AppContext } from "src/types";

export default {
  User: {
    picture: (user: User) => user.pictureUrl,
    fullName: (user: User) => [user.firstName, user.lastName].join(" ").trim(),
    teams(
      user: User,
      args: never,
      context: AppContext
    ): Promise<TeamMember[] | null> {
      const { prismaClient } = context;

      return prismaClient.user
        .findUnique({
          where: {
            id: user.id,
          },
        })
        .teams();
    },
    createdTeams(
      user: User,
      args: never,
      context: AppContext
    ): Promise<Team[] | null> {
      const { prismaClient } = context;

      return prismaClient.user
        .findUnique({
          where: {
            id: user.id,
          },
        })
        .createdTeams();
    },
    isMe(user: User, args: never, context: AppContext): boolean {
      return user.id === context.currentUser!.id;
    },
  },
};
