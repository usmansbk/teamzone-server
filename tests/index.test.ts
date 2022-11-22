import i18n from "src/config/i18n";

test("test", () => {
  expect(i18n.t("hello")).toEqual("Hello, World!");
  expect(process.env.APP_NAME).toBe("Timetable");
});
