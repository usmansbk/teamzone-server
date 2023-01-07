import { Timer } from "@prisma/client";
import { AppContext } from "src/types/index";

export default {
  Timer: {
    isOwner(timer: Timer, _args: never, context: AppContext) {
      return timer.ownerId === context.currentUser?.id;
    },
    owner(timer: Timer, _args: never, context: AppContext) {
      const { prismaClient } = context;

      return prismaClient.timer.findUnique({ where: { id: timer.id } }).owner();
    },
    teams(timer: Timer, _args: never, context: AppContext) {
      const { prismaClient } = context;
      return prismaClient.timer
        .findUnique({
          where: {
            id: timer.id,
          },
        })
        .teams({
          orderBy: [{ name: "asc" }],
        });
    },
  },
};
