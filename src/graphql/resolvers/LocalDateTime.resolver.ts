import dayjs from "dayjs";
import { GraphQLError, GraphQLScalarType, Kind, ValueNode } from "graphql";

const DATE_FORMAT = "YYYY-MM-DDTHH:mm";
const dateScalar = new GraphQLScalarType({
  name: "LocalDateTime",
  description:
    "A local date-time string in the format YYYY-MM-DDTHH:mm, e.g 2022-12-13T16:00.",
  serialize(value): string {
    if (value instanceof Date) {
      return dayjs(value).format(DATE_FORMAT);
    }
    throw new GraphQLError(
      "LocalDateTime cannot represent an invalid Date instance"
    );
  },
  parseValue(value) {
    if (typeof value !== "string") {
      throw new GraphQLError(
        `LocalDateTime cannot represent non string type ${JSON.stringify(
          value
        )}`
      );
    }
    return dayjs(value).format(DATE_FORMAT);
  },
  parseLiteral(ast: ValueNode) {
    if (ast.kind === Kind.STRING) {
      return dayjs(ast.value).format();
    }

    throw new GraphQLError(
      `LocalDateTime cannot represent non string type ${ast.kind}`
    );
  },
});

export default {
  LocalDateTime: dateScalar,
};
