import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { typeDefs as scalarTypeDefs } from "graphql-scalars";

const typesArray = loadFilesSync(path.join(__dirname, "."), {
  recursive: true,
  extensions: ["gql"],
});

export default mergeTypeDefs(typesArray.concat(scalarTypeDefs));
