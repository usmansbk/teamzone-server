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
              role: "ADMIN",
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

      const team = await prismaClient.team.findFirstOrThrow({
        where: {
          inviteCode,
          teammates: {
            some: {
              member: {
                id: {
                  not: currentUser!.id,
                },
              },
            },
          },
        },
      });

      return prismaClient.team.update({
        where: {
          id: team.id,
        },
        data: {
          teammates: {
            create: {
              member: {
                connect: {
                  id: currentUser!.id,
                },
              },
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
    async removeTeammate(
      parent: unknown,
      { memberId }: { memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      const member = await prismaClient.teamMember.findFirstOrThrow({
        where: {
          id: memberId,
          team: {
            OR: [
              {
                owner: {
                  id: currentUser?.id,
                },
              },
              {
                teammates: {
                  some: {
                    member: {
                      id: currentUser?.id,
                    },
                    role: "ADMIN",
                  },
                },
              },
            ],
          },
        },
      });

      return prismaClient.teamMember.delete({
        where: {
          id: member.id,
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
      { memberId }: { memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      const member = await prismaClient.teamMember.findFirstOrThrow({
        where: {
          id: memberId,
          team: {
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
        },
      });

      return prismaClient.teamMember.update({
        where: {
          id: member.id,
        },
        data: {
          role: "ADMIN",
        },
      });
    },
    async removeTeamMemberFromAdmin(
      parent: unknown,
      { memberId }: { memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;

      // check current user has permission
      const member = await prismaClient.teamMember.findFirstOrThrow({
        where: {
          id: memberId,
          team: {
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
        },
      });

      return prismaClient.teamMember.update({
        where: {
          id: member.id,
        },
        data: {
          role: "TEAMMATE",
        },
      });
    },
  },
};
