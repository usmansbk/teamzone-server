import { getTimeZones, timeZonesNames, TimeZone } from "@vvo/tzdb";
import { City } from "country-state-city";

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
    getCitySunriseSunset(
      _parent: unknown,
      { cityName, countryCode }: { cityName: string; countryCode: string }
    ) {
      const cities = City.getCitiesOfCountry(countryCode);
      const city = cities?.find(
        (c) => c.name.toLocaleLowerCase() === cityName.toLocaleLowerCase()
      );
      console.log(city);
      return null;
    },
  },
  TimezoneData: {
    countryFlag: (tz: TimeZone, { height }: { height: number }) =>
      `https://flagcdn.com/h${height}/${tz.countryCode.toLocaleLowerCase()}.png`,
  },
};
