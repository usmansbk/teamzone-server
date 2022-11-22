import { Profile } from "@prisma/client";

export default {
  Profile: {
    picture: (profile: Profile) => profile.pictureUrl,
    fullName: (profile: Profile) =>
      [profile.firstName, profile.lastName].join(" ").trim(),
  },
};
