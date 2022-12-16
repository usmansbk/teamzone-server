import { Prisma } from "@prisma/client";
import {
  FAILED_TO_DELETE_MEETING,
  FAILED_TO_UPDATE_MEETING,
} from "src/constants/responseCodes";
import { AppContext, CreateMeetingInput, UpdateMeetingInput } from "src/types";
import QueryError from "src/utils/errors/QueryError";

export default {
  Mutation: {
    async createMeeting(
      _parent: unknown,
      { input }: { input: CreateMeetingInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      const { teamIds, repeat, ...data } = input;

      const authorizedTeams = await prismaClient.team.findMany({
        where: {
          AND: [
            {
              id: {
                in: teamIds,
              },
            },
            {
              OR: [
                {
                  teammates: {
                    some: {
                      member: {
                        id: currentUser?.id,
                      },
                      role: "ADMIN",
                    },
                  },
                },
                {
                  owner: {
                    id: currentUser?.id,
                  },
                },
              ],
            },
          ],
        },
      });

      return prismaClient.meeting.create({
        data: {
          ...data,
          repeat: repeat || Prisma.JsonNull,
          owner: {
            connect: {
              id: currentUser?.id,
            },
          },
          teams: { connect: authorizedTeams.map((team) => ({ id: team.id })) },
        },
      });
    },
    async updateMeeting(
      _parent: unknown,
      { input }: { input: UpdateMeetingInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;
      const { id, teamIds, repeat, ...data } = input;

      const meeting = await prismaClient.meeting.findFirst({
        where: {
          id,
          owner: {
            id: currentUser?.id,
          },
        },
        include: {
          teams: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!meeting) {
        throw new QueryError(t(FAILED_TO_UPDATE_MEETING));
      }

      const authorizedTeams = await prismaClient.team.findMany({
        where: {
          AND: [
            {
              id: {
                in: teamIds,
              },
            },
            {
              OR: [
                {
                  teammates: {
                    some: {
                      member: {
                        id: currentUser?.id,
                      },
                      role: "ADMIN",
                    },
                  },
                },
                {
                  owner: {
                    id: currentUser?.id,
                  },
                },
              ],
            },
          ],
        },
      });

      const currentTeamIds = meeting.teams.map((team) => team.id);
      const authorizedTeamIds = authorizedTeams.map((team) => team.id);
      const removedTeamIds = currentTeamIds.filter(
        (teamId) => !authorizedTeamIds.includes(teamId)
      );

      return prismaClient.meeting.update({
        where: {
          id: meeting.id,
        },
        data: {
          ...data,
          repeat: repeat || Prisma.JsonNull,
          teams: {
            connect: authorizedTeamIds.map((teamId) => ({ id: teamId })),
            disconnect: removedTeamIds.map((teamId) => ({ id: teamId })),
          },
        },
      });
    },
    async deleteMeeting(
      _parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      const meeting = await prismaClient.meeting.findFirst({
        where: {
          id,
          owner: {
            id: currentUser?.id,
          },
        },
      });

      if (!meeting) {
        throw new QueryError(t(FAILED_TO_DELETE_MEETING));
      }

      return prismaClient.meeting.delete({
        where: {
          id,
        },
      });
    },
  },
};
