import { GraphQLError } from "graphql";
import { nanoid } from "nanoid";
import { AUTHORIZATION_ERROR } from "src/constants/errors";
import type { AppContext, CreateTeamInput, UpdateTeamInput } from "src/types";

export default {
  Mutation: {
    async createTeam(
      parent: unknown,
      { input }: { input: CreateTeamInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      const { name } = input;
      return prismaClient.team.create({
        data: {
          name,
          inviteCode: nanoid(),
          owner: {
            connect: {
              id: currentUser?.id,
            },
          },
        },
      });
    },
    async updateTeam(
      parent: unknown,
      { input }: { input: UpdateTeamInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      const { id, name } = input;

      const team = await prismaClient.team.findFirst({
        where: {
          OR: [
            {
              ownerId: currentUser!.id,
            },
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                  role: "ADMIN",
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new GraphQLError(AUTHORIZATION_ERROR, {
          extensions: {
            code: AUTHORIZATION_ERROR,
          },
        });
      }

      return prismaClient.team.update({
        data: {
          name,
        },
        where: {
          id,
        },
      });
    },
    async deleteTeam(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      const team = await prismaClient.team.findFirst({
        where: {
          OR: [
            {
              ownerId: currentUser!.id,
            },
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                  role: "ADMIN",
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new GraphQLError(AUTHORIZATION_ERROR, {
          extensions: {
            code: AUTHORIZATION_ERROR,
          },
        });
      }

      return prismaClient.team.delete({
        where: {
          id,
        },
      });
    },
    async joinTeam(
      parent: unknown,
      { inviteCode }: { inviteCode: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      const team = await prismaClient.team.findFirstOrThrow({
        where: {
          inviteCode,
          teammates: {
            none: {
              member: {
                id: currentUser!.id,
              },
            },
          },
          owner: {
            id: {
              not: currentUser!.id,
            },
          },
          isArchived: {
            not: true,
          },
        },
      });

      return prismaClient.teamMember.create({
        data: {
          team: {
            connect: {
              id: team.id,
            },
          },
          member: {
            connect: {
              id: currentUser!.id,
            },
          },
        },
      });
    },
    async leaveTeam(
      parent: unknown,
      { teamId }: { teamId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      const teamMember = await prismaClient.teamMember.findFirstOrThrow({
        where: {
          member: {
            id: currentUser!.id,
          },
          team: {
            id: teamId,
          },
        },
      });

      return prismaClient.teamMember.delete({
        where: {
          id: teamMember.id,
        },
      });
    },
    async removeTeammates(
      parent: unknown,
      { memberIds }: { memberIds: string[] },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      const team = await prismaClient.team.findFirst({
        where: {
          OR: [
            {
              ownerId: currentUser!.id,
            },
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                  role: "ADMIN",
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new GraphQLError(AUTHORIZATION_ERROR, {
          extensions: {
            code: AUTHORIZATION_ERROR,
          },
        });
      }

      return prismaClient.teamMember.deleteMany({
        where: {
          AND: [
            {
              id: {
                in: memberIds,
              },
            },
            {
              member: {
                id: {
                  not: currentUser!.id,
                },
              },
            },
          ],
        },
      });
    },
    async archiveTeam(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      const team = await prismaClient.team.findFirst({
        where: {
          OR: [
            {
              ownerId: currentUser!.id,
            },
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                  role: "ADMIN",
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new GraphQLError(AUTHORIZATION_ERROR, {
          extensions: {
            code: AUTHORIZATION_ERROR,
          },
        });
      }

      return prismaClient.team.update({
        where: {
          id,
        },
        data: {
          isArchived: true,
        },
      });
    },
    async unarchiveTeam(
      parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      const team = await prismaClient.team.findFirst({
        where: {
          OR: [
            {
              ownerId: currentUser!.id,
            },
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                  role: "ADMIN",
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new GraphQLError(AUTHORIZATION_ERROR, {
          extensions: {
            code: AUTHORIZATION_ERROR,
          },
        });
      }

      return prismaClient.team.update({
        where: {
          id,
        },
        data: {
          isArchived: false,
        },
      });
    },
  },
};
