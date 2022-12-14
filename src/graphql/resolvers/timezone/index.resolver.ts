import { getTimeZones, TimeZone } from "@vvo/tzdb";

const timeZones = getTimeZones({ includeUtc: true });
export default {
  Query: {
    timezones() {
      return timeZones;
    },
    getTimezonesByCountry(
      _parent: unknown,
      { countryCode }: { countryCode: string }
    ) {
      return timeZones.filter((t) => t.countryCode === countryCode);
    },
    getTimezoneById(_parent: unknown, { id }: { id: string }) {
      return timeZones.find(
        (timeZone) => id === timeZone.name || timeZone.group.includes(id!)
      );
    },
  },
  TimezoneData: {
    countryFlag: (tz: TimeZone, { height }: { height: number }) =>
      tz.countryCode &&
      `https://flagcdn.com/h${height}/${tz.countryCode.toLocaleLowerCase()}.png`,
  },
};
