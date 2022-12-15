import type { Team, User } from "@prisma/client";
import { getTimeZones } from "@vvo/tzdb";
import dayjs from "src/utils/dayjs";
import { AppContext } from "src/types";
import fileUrl from "src/utils/imageFileUrl";

export default {
  User: {
    fullName: (user: User) => [user.firstName, user.lastName].join(" ").trim(),
    tzData(user: User) {
      const timeZones = getTimeZones({ includeUtc: true });
      return timeZones.find(
        (timeZone) =>
          user.timezone === timeZone.name ||
          timeZone.group.includes(user.timezone!)
      );
    },
    teams(
      user: User,
      args: never,
      context: AppContext
    ): Promise<Team[] | null> {
      const { prismaClient } = context;

      return prismaClient.team.findMany({
        where: {
          teammates: {
            some: {
              memberId: user.id,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
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
    async upcomingMeeting(user: User, args: never, context: AppContext) {
      const { prismaClient } = context;

      return prismaClient.meeting.findFirst({
        where: {
          OR: [
            {
              owner: {
                id: user.id,
              },
            },
            {
              teams: {
                some: {
                  teammates: {
                    some: {
                      member: {
                        id: user.id,
                      },
                    },
                  },
                },
              },
            },
          ],
          from: {
            gte: dayjs().utc().toDate(),
            lt: dayjs().utc().endOf("day").toDate(),
          },
        },
        orderBy: [
          {
            from: "asc",
          },
        ],
      });
    },
  },
};
