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
    getTeammatesByTimezone(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      return prismaClient.teamMember.findMany({
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
