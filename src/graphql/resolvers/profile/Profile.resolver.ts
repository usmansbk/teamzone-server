import { Profile } from "@prisma/client";

export default {
  Profile: {
    picture: (profile: Profile) => profile.pictureUrl,
  },
};
