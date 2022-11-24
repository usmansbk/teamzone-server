import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

// TODO: use prima middleware to handler s3 objects on file delete

export default prismaClient;
