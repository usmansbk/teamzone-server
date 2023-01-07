import { Prisma } from "@prisma/client";
import { AppContext } from "src/types/index";
import dayjs from "src/utils/dayjs";

export default {
  Query: {
    getTimers(
      _parent: unknown,
      { state }: { state: "ACTIVE" | "INACTIVE" },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      let filterQuery: Prisma.TimerFindFirstArgs;

      if (state === "INACTIVE") {
        filterQuery = {
          orderBy: [
            {
              dateTime: "desc",
            },
          ],
          where: {
            dateTime: {
              lt: dayjs.utc().toDate(),
            },
          },
        };
      } else {
        filterQuery = {
          orderBy: [
            {
              dateTime: "asc",
            },
          ],
          where: {
            OR: [
              {
                dateTime: {
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

      const timers = prismaClient.timer.findMany({
        where: {
          ...filterQuery.where,
          OR: [
            {
              owner: {
                id: currentUser!.id,
              },
            },
            {
              teams: {
                some: {
                  OR: [
                    {
                      owner: {
                        id: currentUser!.id,
                      },
                    },
                    {
                      teammates: {
                        some: {
                          member: {
                            id: currentUser!.id,
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
        orderBy: [{ dateTime: "asc" }, { title: "asc" }],
      });

      return {
        timers,
      };
    },
    getTimerById(
      _parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      return prismaClient.timer.findFirst({
        where: {
          id,
          OR: [
            {
              owner: {
                id: currentUser!.id,
              },
            },
            {
              teams: {
                some: {
                  OR: [
                    {
                      owner: {
                        id: currentUser!.id,
                      },
                    },
                    {
                      teammates: {
                        some: {
                          member: {
                            id: currentUser!.id,
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
      });
    },
  },
};
