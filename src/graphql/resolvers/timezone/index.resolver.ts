import { getTimeZones, TimeZone } from "@vvo/tzdb";

export default {
  Query: {
    timezones() {
      return getTimeZones({ includeUtc: true });
    },
  },
  TimezoneData: {
    flag: (tz: TimeZone, { height }: { height: number }) =>
      `https://flagcdn.com/h${height}/${tz.countryCode.toLocaleLowerCase()}.png`,
  },
};
