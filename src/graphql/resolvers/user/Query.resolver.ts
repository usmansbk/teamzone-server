import { AppContext } from "src/types";

export default {
  Query: {
    me: (parent: unknown, args: never, context: AppContext) => {
      const { currentUser } = context;

      return currentUser;
    },
  },
};
