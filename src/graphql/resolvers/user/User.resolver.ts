import type { User } from "@prisma/client";

export default {
  User: {
    picture: (user: User) => user.pictureUrl,
    fullName: (user: User) => [user.firstName, user.lastName].join(" ").trim(),
  },
};
