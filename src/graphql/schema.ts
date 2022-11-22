import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import authDirectiveTransformer from "./directives/auth";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default authDirectiveTransformer(schema, "auth");
