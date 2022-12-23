import { Team, TeamMember, User } from "@prisma/client";
import { AppContext } from "src/types";
import fileUrl from "src/utils/imageFileUrl";

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
        .teammates({
          orderBy: [
            {
              member: {
                firstName: "asc",
              },
            },
            {
              member: {
                lastName: "asc",
              },
            },
          ],
        });
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
    async logo(
      team: Team,
      args: { width: number; height: number },
      context: AppContext
    ): Promise<string | null> {
      const { prismaClient } = context;

      const logo = await prismaClient.team
        .findUnique({ where: { id: team.id } })
        .logo();

      return logo && fileUrl(logo, args);
    },
    async isMember(team: Team, args: never, context: AppContext) {
      const { prismaClient, currentUser } = context;

      const teammates = await prismaClient.team
        .findUnique({
          where: {
            id: team.id,
          },
        })
        .teammates({
          where: {
            member: {
              id: currentUser?.id,
            },
          },
        });

      return !!teammates?.length;
    },
    async isAdmin(team: Team, args: never, context: AppContext) {
      const { prismaClient, currentUser } = context;

      if (team.ownerId !== currentUser?.id) {
        const teammates = await prismaClient.team
          .findUnique({
            where: {
              id: team.id,
            },
          })
          .teammates({
            where: {
              role: "ADMIN",
              member: {
                id: currentUser?.id,
              },
            },
          });

        return !!teammates?.length;
      }
      return true;
    },
    async isPinned(team: Team, args: never, context: AppContext) {
      const { prismaClient, currentUser } = context;

      const pinnedTeams = await prismaClient.team
        .findUnique({
          where: {
            id: team.id,
          },
        })
        .pinnedBy({
          where: {
            member: {
              id: currentUser?.id,
            },
          },
        });

      return !!pinnedTeams?.length;
    },
  },
};
