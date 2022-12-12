import { Team } from "@prisma/client";
import { TEAM_NOT_FOUND } from "src/constants/responseCodes";
import { AppContext } from "src/types";
import QueryError from "src/utils/errors/QueryError";

export default {
  Query: {
    async getTeamById(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ): Promise<Team> {
      const { prismaClient, currentUser, t } = context;

      const team = await prismaClient.team.findFirst({
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

      if (!team) {
        throw new QueryError(t(TEAM_NOT_FOUND));
      }

      return team;
    },
    getTeamPreviewByCode(
      parent: unknown,
      { code }: { code: string },
      context: AppContext
    ) {
      const { prismaClient } = context;

      return prismaClient.team.findFirst({
        where: {
          inviteCode: code,
        },
        select: {
          name: true,
          logo: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              teammates: true,
            },
          },
        },
      });
    },
    getTeammatesByTimezone(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      return prismaClient.teamMember.findMany({
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
        distinct: ["memberId"],
        where: {
          team: {
            teammates: {
              some: {
                member: {
                  id: currentUser!.id,
                },
              },
            },
          },
          member: {
            timezone: id,
          },
        },
      });
    },
  },
};
