import { GraphQLError } from "graphql";
import { AUTHENTICATION_ERROR } from "src/constants/errors";

export default class AuthenticationError extends GraphQLError {
  constructor(message: string, cause?: Error) {
    super(message, {
      extensions: {
        code: AUTHENTICATION_ERROR,
        http: {
          status: 401,
        },
      },
    });
    this.cause = cause;
  }
}
