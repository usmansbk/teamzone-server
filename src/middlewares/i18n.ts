import { join, resolve } from "path";
import { lstatSync, readdirSync } from "fs";
import i18next from "i18next";
import middleware from "i18next-http-middleware";
import Backend from "i18next-fs-backend";

const localesDir = resolve("locales");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    initImmediate: false,
    fallbackLng: "en",
    ns: ["translation", "errors"],
    defaultNS: "translation",
    preload: readdirSync(localesDir).filter((fileName) => {
      const joinedPath = join(localesDir, fileName);
      return lstatSync(joinedPath).isDirectory();
    }),
    backend: {
      loadPath: join(localesDir, "{{lng}}/{{ns}}.json"),
    },
  });

const i18nMiddleware = () => middleware.handle(i18next);

export default i18nMiddleware;
