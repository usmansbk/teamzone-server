import { AppContext } from "src/types";

export default {
  Query: {
    async getMeetings(_parent: unknown, args: unknown, context: AppContext) {
      const { prismaClient, currentUser } = context;

      const meetings = await prismaClient.meeting.findMany({
        where: {
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
        orderBy: [
          {
            from: "asc",
          },
        ],
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
