import { getTimeZones, timeZonesNames, TimeZone } from "@vvo/tzdb";

export default {
  Query: {
    timezones() {
      return timeZonesNames;
    },
    getTimezonesByCountry(
      _parent: unknown,
      { countryCode }: { countryCode: string }
    ) {
      const timezones = getTimeZones({ includeUtc: true });

      return timezones.filter((t) => t.countryCode === countryCode);
    },
    getTimezoneById(_parent: unknown, { id }: { id: string }) {
      const timezones = getTimeZones({ includeUtc: true });

      return timezones.find(
        (timeZone) => id === timeZone.name || timeZone.group.includes(id!)
      );
    },
  },
  TimezoneData: {
    countryFlag: (tz: TimeZone, { height }: { height: number }) =>
      `https://flagcdn.com/h${height}/${tz.countryCode.toLocaleLowerCase()}.png`,
  },
};
