import type { Team, TeamMember, User } from "@prisma/client";
import { AppContext } from "src/types";
import fileUrl from "src/utils/fileUrl";

export default {
  User: {
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
    async picture(
      user: User,
      args: { width: number; height: number },
      context: AppContext
    ): Promise<string | null> {
      const { prismaClient } = context;
      const avatar = await prismaClient.user
        .findUnique({
          where: {
            id: user.id,
          },
        })
        .avatar();

      if (avatar) {
        return fileUrl(avatar, args);
      }

      return user.pictureUrl;
    },
  },
};
