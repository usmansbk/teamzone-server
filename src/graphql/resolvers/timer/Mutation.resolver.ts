import { Prisma, TimerType } from "@prisma/client";
import dayjs from "src/utils/dayjs";
import {
  FAILED_TO_DELETE_TIMER,
  FAILED_TO_UPDATE_TIMER,
} from "src/constants/responseCodes";
import { AppContext, CreateTimerInput, UpdateTimerInput } from "src/types";
import QueryError from "src/utils/errors/QueryError";

export default {
  Mutation: {
    async createTimer(
      _parent: unknown,
      { input }: { input: CreateTimerInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      const { teamIds, repeat, type, duration, dateTime, startAt, ...data } =
        input;

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

      const start = startAt ? dayjs.utc(startAt) : dayjs.utc();
      return prismaClient.timer.create({
        data: {
          ...data,
          type,
          duration,
          dateTime:
            type === TimerType.DURATION
              ? start.add(dayjs.duration(duration)).toDate()
              : dateTime,
          startAt: start.toDate(),
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
    async updateTimer(
      _parent: unknown,
      { input }: { input: UpdateTimerInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;
      const {
        id,
        teamIds,
        repeat,
        type,
        duration,
        startAt,
        dateTime,
        ...data
      } = input;

      const timer = await prismaClient.timer.findFirst({
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

      if (!timer) {
        throw new QueryError(t(FAILED_TO_UPDATE_TIMER));
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

      const currentTeamIds = timer.teams.map((team) => team.id);
      const authorizedTeamIds = authorizedTeams.map((team) => team.id);
      const removedTeamIds = currentTeamIds.filter(
        (teamId) => !authorizedTeamIds.includes(teamId)
      );

      const start = startAt ? dayjs.utc(startAt) : dayjs.utc();
      return prismaClient.timer.update({
        where: {
          id: timer.id,
        },
        data: {
          ...data,
          type,
          duration,
          dateTime:
            type === TimerType.DURATION
              ? start.add(dayjs.duration(duration)).toDate()
              : dateTime,
          startAt: start.toDate(),
          repeat: repeat || Prisma.JsonNull,
          teams: {
            connect: authorizedTeamIds.map((teamId) => ({ id: teamId })),
            disconnect: removedTeamIds.map((teamId) => ({ id: teamId })),
          },
        },
      });
    },
    async deleteTimer(
      _parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      const timer = await prismaClient.timer.findFirst({
        where: {
          id,
          owner: {
            id: currentUser?.id,
          },
        },
      });

      if (!timer) {
        throw new QueryError(t(FAILED_TO_DELETE_TIMER));
      }

      return prismaClient.timer.delete({
        where: {
          id,
        },
      });
    },
  },
};
