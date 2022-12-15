import { AppContext } from "src/types";
import dayjs from "src/utils/dayjs";

export default {
  Query: {
    async getMeetings(_parent: unknown, args: unknown, context: AppContext) {
      const { prismaClient, currentUser } = context;

      const meetings = await prismaClient.meeting.findMany({
        orderBy: [
          {
            from: "asc",
          },
        ],
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
          from: {
            gte: dayjs.utc().toDate(),
          },
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
