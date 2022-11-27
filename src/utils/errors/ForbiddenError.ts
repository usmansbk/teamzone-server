import { GraphQLError } from "graphql";
import { AUTHORIZATION_ERROR } from "src/constants/errors";

export default class ForbiddenError extends GraphQLError {
  constructor(message: string, cause?: Error) {
    super(message, {
      extensions: {
        code: AUTHORIZATION_ERROR,
        http: {
          status: 403,
        },
      },
    });
    this.cause = cause;
  }
}
