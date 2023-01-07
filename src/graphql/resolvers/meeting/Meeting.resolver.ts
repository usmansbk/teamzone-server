import { Meeting } from "@prisma/client";
import { AppContext } from "src/types";

export default {
  Meeting: {
    isOwner(meeting: Meeting, args: never, context: AppContext) {
      return meeting.ownerId === context.currentUser?.id;
    },
    owner(meeting: Meeting, args: never, context: AppContext) {
      const { prismaClient } = context;
      return prismaClient.meeting
        .findUnique({
          where: {
            id: meeting.id,
          },
        })
        .owner();
    },
    teams(meeting: Meeting, args: never, context: AppContext) {
      const { prismaClient } = context;
      return prismaClient.meeting
        .findUnique({
          where: {
            id: meeting.id,
          },
        })
        .teams({
          orderBy: [{ name: "asc" }],
        });
    },
  },
};
