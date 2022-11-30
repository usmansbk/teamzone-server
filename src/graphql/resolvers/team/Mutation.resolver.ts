import { nanoid } from "nanoid";
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
          teammates: {
            create: {
              member: {
                connect: {
                  id: currentUser?.id,
                },
              },
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

      // check current user has permission
      await prismaClient.team.findFirstOrThrow({
        where: {
          id,
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
      { teamId }: { teamId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      await prismaClient.team.findFirstOrThrow({
        where: {
          id: teamId,
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

      return prismaClient.team.delete({
        where: {
          id: teamId,
        },
      });
    },
    async joinTeam(
      parent: unknown,
      { inviteCode }: { inviteCode: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user is not already a member
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
      { memberIds, teamId }: { teamId: string; memberIds: string[] },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      await prismaClient.team.findFirstOrThrow({
        where: {
          id: teamId,
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

      return prismaClient.teamMember.deleteMany({
        where: {
          team: {
            id: teamId,
          },
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
      { teamId }: { teamId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      await prismaClient.team.findFirstOrThrow({
        where: {
          id: teamId,
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

      return prismaClient.team.update({
        where: {
          id: teamId,
        },
        data: {
          isArchived: true,
        },
      });
    },
    async unarchiveTeam(
      parent: unknown,
      { teamId }: { teamId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      await prismaClient.team.findFirstOrThrow({
        where: {
          id: teamId,
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

      return prismaClient.team.update({
        where: {
          id: teamId,
        },
        data: {
          isArchived: false,
        },
      });
    },
    async addTeamMemberToAdmin(
      parent: unknown,
      { teamId, memberId }: { teamId: string; memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      await prismaClient.team.findFirstOrThrow({
        where: {
          id: teamId,
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

      return prismaClient.teamMember.update({
        where: {
          id: memberId,
        },
        data: {
          role: "ADMIN",
        },
      });
    },
    async removeTeamMemberFromAdmin(
      parent: unknown,
      { teamId, memberId }: { teamId: string; memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      await prismaClient.team.findFirstOrThrow({
        where: {
          id: teamId,
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

      return prismaClient.teamMember.update({
        where: {
          id: memberId,
        },
        data: {
          role: "TEAMMATE",
        },
      });
    },
  },
};
