import path from "path";
import { mergeResolvers } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import { resolvers as scalarResolvers } from "graphql-scalars";

const resolversArray = loadFilesSync(path.join(__dirname, "./**/*.resolver.*"));

export default mergeResolvers(resolversArray.concat(scalarResolvers));
