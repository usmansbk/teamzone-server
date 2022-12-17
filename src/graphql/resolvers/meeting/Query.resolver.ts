import { Prisma } from "@prisma/client";
import { AppContext } from "src/types";
import dayjs from "src/utils/dayjs";

export default {
  Query: {
    async getMeetings(
      _parent: unknown,
      { sort }: { sort: "upcoming" | "past" },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      let query: Prisma.MeetingFindManyArgs;

      if (sort === "past") {
        query = {
          orderBy: [
            {
              from: "desc",
            },
          ],
          where: {
            OR: [
              {
                to: {
                  lt: dayjs.utc().toDate(),
                },
              },
              {
                repeat: {
                  not: Prisma.JsonNull,
                },
              },
            ],
          },
        };
      } else {
        query = {
          orderBy: [
            {
              from: "asc",
            },
          ],
          where: {
            OR: [
              {
                to: {
                  gte: dayjs.utc().toDate(),
                },
              },
              {
                repeat: {
                  not: Prisma.JsonNull,
                },
              },
            ],
          },
        };
      }

      const meetings = await prismaClient.meeting.findMany({
        orderBy: query.orderBy,
        where: {
          OR: [
            {
              owner: {
                id: currentUser?.id,
              },
            },
            {
              teams: {
                some: {
                  teammates: {
                    some: {
                      member: {
                        id: currentUser?.id,
                      },
                    },
                  },
                },
              },
            },
          ],
          ...query.where,
        },
      });

      return {
        meetings,
      };
    },
    getMeetingById(
      _parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      return prismaClient.meeting.findFirst({
        where: {
          AND: [
            {
              id,
            },
            {
              OR: [
                {
                  owner: {
                    id: currentUser?.id,
                  },
                },
                {
                  teams: {
                    some: {
                      OR: [
                        {
                          owner: {
                            id: currentUser?.id,
                          },
                        },
                        {
                          teammates: {
                            some: {
                              member: {
                                id: currentUser?.id,
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      });
    },
  },
};
