import { getTimeZones } from "@vvo/tzdb";

export default {
  Query: {
    timezones() {
      return getTimeZones({ includeUtc: true });
    },
  },
};
