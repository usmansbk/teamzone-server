import { defaultFieldResolver, GraphQLSchema } from "graphql";
import { MapperKind, mapSchema, getDirective } from "@graphql-tools/utils";
import type { AppContext, AuthRule } from "src/types";
import AuthenticationError from "src/utils/errors/AuthenticationError";
import ForbiddenError from "src/utils/errors/ForbiddenError";
import {
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
} from "src/constants/errors";

export default function authDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string
) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};

  return mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      const authDirective = getDirective(schema, type, directiveName)?.[0];
      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }
      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const authDirective =
        getDirective(schema, fieldConfig, directiveName)?.[0] ??
        typeDirectiveArgumentMaps[typeName];
      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        return {
          ...fieldConfig,
          async resolve(source, args, context: AppContext, info) {
            const { currentUser, t } = context;

            if (!currentUser) {
              throw new AuthenticationError(
                t(AUTHENTICATION_ERROR, { ns: "errors" })
              );
            }
            const { rules } = authDirective as { rules: AuthRule[] };

            if (rules) {
              const checks = rules.map(({ allow, identityClaim }) => {
                switch (allow) {
                  case "owner": {
                    return source[identityClaim] === currentUser.id;
                  }
                  default: {
                    return false;
                  }
                }
              });

              if (!checks.some((allowed) => allowed)) {
                throw new ForbiddenError(
                  t(AUTHORIZATION_ERROR, { ns: "errors" })
                );
              }
            }
            return resolve(source, args, context, info);
          },
        };
      }

      return fieldConfig;
    },
  });
}
